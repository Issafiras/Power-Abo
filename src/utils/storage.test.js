import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  saveTelmoreAbGroup, 
  loadTelmoreAbGroup, 
  resetAll 
} from './storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Telmore A/B Group', () => {
    it('should save and load Telmore A/B group', () => {
      saveTelmoreAbGroup('treatment');
      expect(loadTelmoreAbGroup()).toBe('treatment');
      expect(localStorage.setItem).toHaveBeenCalledWith('power_calculator_telmore_ab_group', '"treatment"');
    });

    it('should return null if no group is saved', () => {
      expect(loadTelmoreAbGroup()).toBeNull();
    });

    it('should be cleared by resetAll', () => {
      saveTelmoreAbGroup('control');
      resetAll();
      expect(loadTelmoreAbGroup()).toBeNull();
    });
  });
});
