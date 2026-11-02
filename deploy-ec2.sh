#!/usr/bin/env bash
# QuantumShield Automated EC2 Provisioning & Deployment Script
# Target Region: ap-southeast-2 (Assigned project Region)
# AWS CLI Profile: quantumshield

set -e

PROFILE="quantumshield"
REGION="ap-southeast-2"
KEY_NAME="quantumshield-key"
KEY_FILE="quantumshield-key.pem"
SG_NAME="quantumshield-sg"
INSTANCE_TYPE="t3.small" # 2 vCPUs, 2 GiB RAM
TAG_NAME="quantumshield-server"

echo "🛡️  Checking AWS CLI credentials for profile: $PROFILE..."
ACCOUNT_ID=$(aws sts get-caller-identity --profile "$PROFILE" --query "Account" --output text 2>&1)

if [[ "$ACCOUNT_ID" == *"expired"* ]] || [[ "$ACCOUNT_ID" == *"Please reauthenticate"* ]]; then
  echo "❌ AWS session expired. Please run:"
  echo "    aws login --profile $PROFILE"
  echo "Then re-run this script."
  exit 1
fi

echo "✓ Connected to Project: $ACCOUNT_ID (Selected Region: $REGION)"

# 1. Verify EC2 service activation
echo "🔍 Verifying EC2 service status in $REGION..."
aws ec2 describe-regions --profile "$PROFILE" --region "$REGION" >/dev/null 2>&1

# 2. Get default VPC and Subnet
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --profile "$PROFILE" --region "$REGION")
SUBNET_ID=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[0].SubnetId" --output text --profile "$PROFILE" --region "$REGION")
echo "✓ Default VPC: $VPC_ID (Subnet: $SUBNET_ID)"

# 3. Create or reuse Security Group
SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$SG_NAME" --query "SecurityGroups[0].GroupId" --output text --profile "$PROFILE" --region "$REGION" 2>/dev/null || true)

if [ "$SG_ID" = "None" ] || [ -z "$SG_ID" ]; then
  echo "Creating Security Group '$SG_NAME'..."
  SG_ID=$(aws ec2 create-security-group \
    --group-name "$SG_NAME" \
    --description "Security group for QuantumShield Web App" \
    --vpc-id "$VPC_ID" \
    --profile "$PROFILE" \
    --region "$REGION" \
    --query "GroupId" --output text)

  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 --profile "$PROFILE" --region "$REGION"
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0 --profile "$PROFILE" --region "$REGION"
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 5001 --cidr 0.0.0.0/0 --profile "$PROFILE" --region "$REGION"
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22 --cidr 0.0.0.0/0 --profile "$PROFILE" --region "$REGION"
  echo "✓ Created Security Group: $SG_ID"
else
  echo "✓ Using existing Security Group: $SG_ID"
fi

# 4. Check for existing running instance
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=$TAG_NAME" "Name=instance-state-name,Values=running,pending" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text \
  --profile "$PROFILE" \
  --region "$REGION" 2>/dev/null || true)

if [ "$INSTANCE_ID" != "None" ] && [ -n "$INSTANCE_ID" ]; then
  echo "✓ Found active EC2 instance: $INSTANCE_ID"
else
  echo "🚀 Launching new EC2 instance ($INSTANCE_TYPE)..."
  AMI_ID=$(aws ssm get-parameter \
    --name "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64" \
    --query "Parameter.Value" \
    --output text \
    --profile "$PROFILE" \
    --region "$REGION")

  USER_DATA=$(base64 << 'EOF'
#!/bin/bash
dnf update -y
dnf install -y docker git
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user
# Install Docker Compose v2
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
ln -s /usr/local/lib/docker/cli-plugins/docker-compose /usr/bin/docker-compose
EOF
)

  INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --count 1 \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SG_ID" \
    --subnet-id "$SUBNET_ID" \
    --user-data "$USER_DATA" \
    --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]' \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$TAG_NAME}]" \
    --profile "$PROFILE" \
    --region "$REGION" \
    --query "Instances[0].InstanceId" \
    --output text)

  echo "✓ Created EC2 instance: $INSTANCE_ID"
  echo "⏳ Waiting for instance to transition to running state..."
  aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --profile "$PROFILE" --region "$REGION"
fi

# 5. Fetch Public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text \
  --profile "$PROFILE" \
  --region "$REGION")

echo "=========================================================="
echo "🎯 QuantumShield EC2 Server Ready!"
echo "   Instance ID: $INSTANCE_ID"
echo "   Public IPv4: $PUBLIC_IP"
echo "=========================================================="

# 6. Ensure key permissions
if [ -f "$KEY_FILE" ]; then
  chmod 400 "$KEY_FILE"
else
  echo "⚠️  Key file $KEY_FILE not found in current directory. SSH deployment will require this file."
  exit 1
fi

echo "⏳ Waiting for SSH and Docker initialization on $PUBLIC_IP (approx. 45s)..."
for i in {1..30}; do
  if ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ec2-user@"$PUBLIC_IP" "docker --version" >/dev/null 2>&1; then
    echo "✓ SSH and Docker are ready!"
    break
  fi
  echo -n "."
  sleep 4
done
echo ""

# 7. Sync codebase to server
echo "📦 Packaging and deploying QuantumShield to server..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@"$PUBLIC_IP" "mkdir -p ~/quantumshield"

rsync -avz --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'backend/node_modules' \
  --exclude 'frontend/node_modules' \
  --exclude 'quantumshield-key.pem' \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  ./ ec2-user@"$PUBLIC_IP":~/quantumshield/

# 8. Build and launch with Docker Compose
echo "🚀 Building and starting containers on $PUBLIC_IP..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@"$PUBLIC_IP" << 'ENDSSH'
cd ~/quantumshield
docker compose down || true
docker compose up --build -d
echo "✓ Containers started successfully!"
docker compose ps
ENDSSH

echo "=========================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "Access QuantumShield at:"
echo "   http://$PUBLIC_IP"
echo ""
echo "To point your domain quantumshieldscan.com:"
echo "   Add an 'A' record in your DNS provider (GoDaddy, Namecheap, Route 53):"
echo "   Host: @   -> Value: $PUBLIC_IP"
echo "   Host: www -> Value: $PUBLIC_IP"
echo "=========================================================="
