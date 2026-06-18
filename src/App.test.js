import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the storefront hero and catalog', () => {
  render(<App />);
  expect(screen.getByText(/Neighborhood Market/i)).toBeInTheDocument();
  expect(screen.getByText(/browse and filter products/i)).toBeInTheDocument();
});
