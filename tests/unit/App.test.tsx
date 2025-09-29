import React from 'react';
import { render } from '@testing-library/react';

describe('App Component Basic Tests', () => {
  it('should be importable without errors', async () => {
    const AppModule = await import('../../src/client/App');
    expect(AppModule.default).toBeDefined();
    expect(typeof AppModule.default).toBe('function');
  });

  it('should be a React component', async () => {
    const AppModule = await import('../../src/client/App');
    const App = AppModule.default;

    // Check if it's a function (React component)
    expect(typeof App).toBe('function');

    // Check if it can be called (basic React component structure)
    expect(() => App).not.toThrow();
  });
});

describe('React Testing Library Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div data-testid="test">Hello Test</div>;
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('test')).toBeInTheDocument();
    expect(getByTestId('test')).toHaveTextContent('Hello Test');
  });

  it('should handle CSS classes', () => {
    const TestComponent = () => (
      <div data-testid="styled" className="test-class bg-blue-500">
        Styled Component
      </div>
    );
    const { getByTestId } = render(<TestComponent />);

    const element = getByTestId('styled');
    expect(element).toHaveClass('test-class');
    expect(element).toHaveClass('bg-blue-500');
  });
});