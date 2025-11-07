import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyDetail from './PropertyDetail';
import type { Property } from '../services/api';

describe('PropertyDetail', () => {
  const mockProperty: Property = {
    id: 1,
    nr_rnal: 12345,
    denominacao: 'Test Property',
    modalidade: 'Apartamento',
    nr_utentes: 4,
    email: 'test@example.com',
    endereco: '123 Test Street',
    codigo_postal: '1000-001',
    localidade: 'Lisboa',
    freguesia: 'Santa Maria',
    concelho: 'Lisboa',
    distrito: 'Lisboa',
    latitude: 38.7223,
    longitude: -9.1393,
    data_registo: '2024-01-01T00:00:00Z',
    data_abertura_publico: '2024-01-15T00:00:00Z',
    created_at: '2024-11-07T00:00:00Z',
  };

  it('should render nothing when property is null', () => {
    const { container } = render(<PropertyDetail property={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render property details', () => {
    render(<PropertyDetail property={mockProperty} onClose={vi.fn()} />);

    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText(/RNAL: 12345/)).toBeInTheDocument();
    expect(screen.getByText('Apartamento')).toBeInTheDocument();
    expect(screen.getByText('4 people')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('123 Test Street')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const onCloseMock = vi.fn();
    const user = userEvent.setup();

    render(<PropertyDetail property={mockProperty} onClose={onCloseMock} />);

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledOnce();
  });

  it('should format dates correctly', () => {
    render(<PropertyDetail property={mockProperty} onClose={vi.fn()} />);

    // Check that dates are formatted (using GB locale format)
    expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
  });

  it('should display coordinates with 6 decimal places', () => {
    render(<PropertyDetail property={mockProperty} onClose={vi.fn()} />);

    expect(screen.getByText(/38.722300, -9.139300/)).toBeInTheDocument();
  });

  it('should handle missing optional fields', () => {
    const minimalProperty: Property = {
      id: 2,
      created_at: '2024-11-07T00:00:00Z',
    };

    render(<PropertyDetail property={minimalProperty} onClose={vi.fn()} />);

    expect(screen.getByText('Unnamed Property')).toBeInTheDocument();
    expect(screen.queryByText(/RNAL:/)).not.toBeInTheDocument();
  });
});
