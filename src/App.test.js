import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MAAPSETU branding and portal elements', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/MAAPSETU/i);
  expect(brandElements.length).toBeGreaterThan(0);
  
  expect(screen.getAllByText(/Every Instrument Has a Story/i).length).toBeGreaterThan(0);
  expect(screen.getByRole('heading', { name: 'Digital Identity' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Field Verification' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Public QR Verification' })).toBeInTheDocument();
});

test('renders verification lifecycle steps', () => {
  render(<App />);
  expect(screen.getByText('REGISTER')).toBeInTheDocument();
  expect(screen.getByText('APPLY')).toBeInTheDocument();
  expect(screen.getByText('VERIFY')).toBeInTheDocument();
  expect(screen.getByText('CERTIFY')).toBeInTheDocument();
  expect(screen.getByText('SCAN')).toBeInTheDocument();
});

test('public QR verification page renders authentic badge and certificate metadata without login', () => {
  window.history.pushState({}, 'Verify', '/verify/LM-CERT-938274');
  render(<App />);
  
  expect(screen.getByText(/✓ AUTHENTIC & VALID/i)).toBeInTheDocument();
  expect(screen.getByText(/LM-CERT-938274/i)).toBeInTheDocument();
  expect(screen.getByText(/LM-TG-WE-00018472/i)).toBeInTheDocument();
  expect(screen.getByText(/WeighTech India/i)).toBeInTheDocument();
});


