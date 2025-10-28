import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';
import { ThemeProvider } from '../../../contexts';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Button', () => {
  it('should render with default props', () => {
    renderWithTheme(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-color-primary', 'text-white');
  });

  it('should apply variant classes correctly', () => {
    const { rerender } = renderWithTheme(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-color-primary');
    
    rerender(
      <ThemeProvider>
        <Button variant="secondary">Secondary</Button>
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass('bg-bg-surface', 'border');
    
    rerender(
      <ThemeProvider>
        <Button variant="ghost">Ghost</Button>
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass('text-color-text', 'hover:bg-color-primary/10');
    
    rerender(
      <ThemeProvider>
        <Button variant="danger">Danger</Button>
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('should apply size classes correctly', () => {
    const { rerender } = renderWithTheme(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');
    
    rerender(
      <ThemeProvider>
        <Button size="md">Medium</Button>
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-body');
    
    rerender(
      <ThemeProvider>
        <Button size="lg">Large</Button>
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('should show loading state', () => {
    renderWithTheme(<Button isLoading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithTheme(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not handle click events when disabled', () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not handle click events when loading', () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button isLoading onClick={handleClick}>Loading</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    renderWithTheme(<Button className="custom-class">Custom</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithTheme(<Button ref={ref}>Ref test</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should have proper accessibility attributes', () => {
    renderWithTheme(<Button>Accessible button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-color-accent');
  });
});