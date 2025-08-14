/**
 * Axiom logging configuration
 * 
 * This file contains configurations for Axiom logging service
 */

// Dataset name for React errors
export const AXIOM_DATASET = 'react-bgsnl';

// API endpoints - can be overridden by environment variables
export const AXIOM_ENDPOINTS = {
  development: 'https://api.axiom.co/v1/datasets/react-bgsnl/ingest',
  production: 'https://api.axiom.co/v1/datasets/react-bgsnl/ingest',
  // Add other environments if needed
};

// Get the current endpoint based on NODE_ENV
export const getAxiomEndpoint = () => {
  const environment = process.env.NODE_ENV || 'development';
  return process.env.REACT_APP_AXIOM_ENDPOINT || AXIOM_ENDPOINTS[environment];
};

// Helper function to determine if Axiom logging is enabled
export const isAxiomLoggingEnabled = () => {
  // Only enable in production by default, or if explicitly enabled in other environments
  if (process.env.NODE_ENV === 'production') return true;
  return process.env.REACT_APP_ENABLE_AXIOM_LOGGING == 1;
};
