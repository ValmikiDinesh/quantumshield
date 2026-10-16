import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { ReadinessScoreGauge } from '../components/common/ReadinessScoreGauge';
import { Navbar } from '../components/common/Navbar';
import { LaymanGuideModal } from '../components/common/LaymanGuideModal';
import { AuthProvider } from '../context/AuthContext';

describe('Frontend Component Tests', () => {
  it('renders SeverityBadge correctly for all severity levels', () => {
    const { rerender } = render(<SeverityBadge severity="Critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();

    rerender(<SeverityBadge severity="High" />);
    expect(screen.getByText('High')).toBeInTheDocument();

    rerender(<SeverityBadge severity="Informational" />);
    expect(screen.getByText('Informational')).toBeInTheDocument();
  });

  it('renders ReadinessScoreGauge with score and risk level label', () => {
    render(<ReadinessScoreGauge score={85} riskLevel="Post-Quantum Prepared" />);
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('/ 100')).toBeInTheDocument();
    expect(screen.getByText(/Post-Quantum Prepared/i)).toBeInTheDocument();
  });

  it('renders Navbar with Valmiki Softwares branding and QuantumShield logo', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('QuantumShield')).toBeInTheDocument();
    expect(screen.getByText('by Valmiki Softwares')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });

  it('renders LaymanGuideModal with plain English quantum explanation when open', () => {
    const { rerender } = render(
      <LaymanGuideModal isOpen={false} onClose={() => {}} />
    );
    expect(screen.queryByText(/Quantum Security Explained in Plain English/i)).not.toBeInTheDocument();

    rerender(<LaymanGuideModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Quantum Security Explained in Plain English/i)).toBeInTheDocument();
    expect(screen.getByText(/The Maze Analogy/i)).toBeInTheDocument();
    expect(screen.getByText(/Harvest Now, Decrypt Later/i)).toBeInTheDocument();
    expect(screen.getByText(/FIPS 203: ML-KEM/i)).toBeInTheDocument();
  });
});
