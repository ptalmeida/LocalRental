import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyList from './PropertyList';
import type { Property } from '../services/api';

describe('PropertyList', () => {
  const mockProperties: Property[] = [
    {
      id: 1,
      nr_rnal: 12345,
      denominacao: 'Property One',
      modalidade: 'Apartamento',
      concelho: 'Lisboa',
      distrito: 'Lisboa',
      nr_utentes: 4,
      created_at: '2024-11-07T00:00:00Z',
    },
    {
      id: 2,
      nr_rnal: 67890,
      denominacao: 'Property Two',
      modalidade: 'Moradia',
      concelho: 'Porto',
      distrito: 'Porto',
      nr_utentes: 6,
      created_at: '2024-11-07T00:00:00Z',
    },
  ];

  it('should render property list', () => {
    render(
      <PropertyList
        properties={mockProperties}
        selectedProperty={null}
        onPropertySelect={vi.fn()}
        onSearch={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('Property One')).toBeInTheDocument();
    expect(screen.getByText('Property Two')).toBeInTheDocument();
    expect(screen.getByText('2 results')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <PropertyList
        properties={[]}
        selectedProperty={null}
        onPropertySelect={vi.fn()}
        onSearch={vi.fn()}
        isLoading={true}
      />
    );

    // Check for spinner (has animate-spin class)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should show empty state when no properties', () => {
    render(
      <PropertyList
        properties={[]}
        selectedProperty={null}
        onPropertySelect={vi.fn()}
        onSearch={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('No properties found')).toBeInTheDocument();
  });

  it('should call onPropertySelect when property is clicked', async () => {
    const onSelectMock = vi.fn();
    const user = userEvent.setup();

    render(
      <PropertyList
        properties={mockProperties}
        selectedProperty={null}
        onPropertySelect={onSelectMock}
        onSearch={vi.fn()}
        isLoading={false}
      />
    );

    await user.click(screen.getByText('Property One'));

    expect(onSelectMock).toHaveBeenCalledWith(mockProperties[0]);
  });

  it('should highlight selected property', () => {
    const { container } = render(
      <PropertyList
        properties={mockProperties}
        selectedProperty={mockProperties[0]}
        onPropertySelect={vi.fn()}
        onSearch={vi.fn()}
        isLoading={false}
      />
    );

    // Find the selected property div (has bg-blue-50 class)
    const selectedDiv = container.querySelector('.bg-blue-50');
    expect(selectedDiv).toBeInTheDocument();
    expect(selectedDiv).toHaveTextContent('Property One');
  });

  it('should toggle filters panel', async () => {
    const user = userEvent.setup();

    render(
      <PropertyList
        properties={mockProperties}
        selectedProperty={null}
        onPropertySelect={vi.fn()}
        onSearch={vi.fn()}
        isLoading={false}
      />
    );

    const toggleButton = screen.getByText('Show Filters');
    await user.click(toggleButton);

    expect(screen.getByText('Hide Filters')).toBeInTheDocument();
    expect(screen.getByLabelText('District (Distrito)')).toBeInTheDocument();
    expect(screen.getByLabelText('Municipality (Concelho)')).toBeInTheDocument();
  });

  it('should call onSearch when filters are changed', async () => {
    const onSearchMock = vi.fn();
    const user = userEvent.setup();

    render(
      <PropertyList
        properties={mockProperties}
        selectedProperty={null}
        onPropertySelect={vi.fn()}
        onSearch={onSearchMock}
        isLoading={false}
      />
    );

    // Open filters
    await user.click(screen.getByText('Show Filters'));

    // Type in district filter
    const distritoInput = screen.getByLabelText('District (Distrito)');
    await user.type(distritoInput, 'Lisboa');

    expect(onSearchMock).toHaveBeenCalled();
  });

  it('should clear filters', async () => {
    const onSearchMock = vi.fn();
    const user = userEvent.setup();

    render(
      <PropertyList
        properties={mockProperties}
        selectedProperty={null}
        onPropertySelect={vi.fn()}
        onSearch={onSearchMock}
        isLoading={false}
      />
    );

    // Open filters
    await user.click(screen.getByText('Show Filters'));

    // Add a filter
    const distritoInput = screen.getByLabelText('District (Distrito)');
    await user.type(distritoInput, 'Lisboa');

    // Clear filters
    await user.click(screen.getByText('Clear Filters'));

    expect(onSearchMock).toHaveBeenCalledWith({});
  });
});
