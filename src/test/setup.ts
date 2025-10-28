import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock Tauri API
const mockTauri = {
  invoke: vi.fn(),
  listen: vi.fn(),
  emit: vi.fn(),
};

// Mock the Tauri API module
vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockTauri.invoke,
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: mockTauri.listen,
  emit: mockTauri.emit,
}));

// Global test utilities
(globalThis as any).mockTauri = mockTauri;

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});