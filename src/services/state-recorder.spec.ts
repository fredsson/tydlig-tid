import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { RecorderStorage, StateRecorder } from "./state-recorder";
import { default as createDate, Dayjs } from "dayjs";

const SMALL_EXAMPLE_STATE = `{
  "projects": [
    {"name": "Lunch", "id": 1, "color": "red"},
    {"name": "Internal", "id": 2, "color": "#28a745"}
  ],
  "timelines": {
    "2023-04-13": [
      {"startTime": "8:10", "endTime": "12:00", "projectId": 2},
      {"startTime": "12:00", "endTime": "13:00", "projectId": 1},
      {"startTime": "13:00", "endTime": "17:00", "projectId": 1}
    ]
  }
}`;

describe('StateRecorder', () => {
  let stateRecorder: StateRecorder;

  let mockStorage: RecorderStorage;
  let mockCreateDate: (date?: string) => Dayjs;

  beforeEach(() => {
    mockCreateDate = vi.fn((date?: string) => {
      if (!date) {
        return createDate('2023-04-13T16:00');
      }
      return createDate(date);
    });
    mockStorage = {
      setItem: vi.fn(),
      getItem: vi.fn(() => SMALL_EXAMPLE_STATE),
    }

    stateRecorder = new StateRecorder(mockStorage, mockCreateDate);
  });

  it('should be created', () => {
    expect(stateRecorder).toBeTruthy();
  });

  it('should load state from storage when created', () => {
    const today = stateRecorder.today();

    expect(today).toBeDefined();
    expect(today?.lunchTimeInMinutes).toBe(60);
  });

  describe('startDay', () => {
    beforeEach(() => {
      mockCreateDate = vi.fn((date?: string) => {
        if (!date) {
          return createDate('2023-04-14T08:10');
        }

        return createDate(date);
      });
    });

    it('should add timeline correctly', () => {
      stateRecorder.startDay(2, createDate('2023-04-14T08:10'));

      const [_, content] = (mockStorage.setItem as Mock).mock.lastCall;
      const state = JSON.parse(content);

      expect(state.timelines['2023-04-14'].length).toBe(1);
      expect(state.timelines['2023-04-14'][0]).toEqual({
        startTime: '08:10',
        endTime: '08:10',
        projectId: 2,
      });
    });

    it('should add timeline correctly when stored state is empty', () => {
      mockStorage.getItem = vi.fn(() => null);
      stateRecorder = new StateRecorder(mockStorage, mockCreateDate);

      stateRecorder.startDay(2, createDate('2023-04-14T08:10'));

      const [_, content] = (mockStorage.setItem as Mock).mock.lastCall;
      const state = JSON.parse(content);

      expect(state.timelines['2023-04-14'].length).toBe(1);
      expect(state.timelines['2023-04-14'][0]).toEqual({
        startTime: '08:10',
        endTime: '08:10',
        projectId: 2,
      });
    });

    it('should set current project correctly', () => {
      stateRecorder.startDay(2, createDate('2023-04-14T08:10'));

      stateRecorder.updateCurrentProject(createDate('2023-04-14T15:00'));

      const [_, content] = (mockStorage.setItem as Mock).mock.lastCall;
      const state = JSON.parse(content);

      expect(state.timelines['2023-04-14'][0].endTime).toEqual('15:00');
    });
  });
});
