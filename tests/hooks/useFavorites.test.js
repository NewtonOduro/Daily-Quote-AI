/**
 * useFavorites.test.js
 * ------------------------------------------------------------------
 * Unit tests for useFavorites: saving, removing, and preventing
 * duplicate favorites in local storage.
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import useFavorites from "../../hooks/useFavorites";

const sampleQuote = (id) => ({
  id,
  text: `Quote ${id}`,
  author: "Author",
  category: "wisdom"
});

describe("useFavorites", () => {
  beforeEach(() => {
    chrome.storage.local.set({ "dq.favorites": [] });
  });

  test("starts with an empty favorites list", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.favorites).toEqual([]);
  });

  test("adds a favorite", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    let added;
    await act(async () => {
      added = await result.current.addFavorite(sampleQuote("q1"));
    });
    expect(added).toBe(true);
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorite("q1")).toBe(true);
  });

  test("prevents duplicate favorites by id", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.addFavorite(sampleQuote("q1"));
      await result.current.addFavorite(sampleQuote("q1"));
    });
    expect(result.current.favorites).toHaveLength(1);
  });

  test("removes a favorite", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.addFavorite(sampleQuote("q1"));
    });
    let removed;
    await act(async () => {
      removed = await result.current.removeFavorite("q1");
    });
    expect(removed).toBe(true);
    expect(result.current.favorites).toHaveLength(0);
    expect(result.current.isFavorite("q1")).toBe(false);
  });

  test("toggles favorite state", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    let state;
    await act(async () => {
      state = await result.current.toggleFavorite(sampleQuote("q1"));
    });
    expect(state).toBe(true);
    await act(async () => {
      state = await result.current.toggleFavorite(sampleQuote("q1"));
    });
    expect(state).toBe(false);
  });

  test("persists favorites to local storage", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.addFavorite(sampleQuote("qSaved"));
    });
    const stored = await chrome.storage.local.get("dq.favorites");
    expect(stored["dq.favorites"]).toHaveLength(1);
    expect(chrome.storage.local.set).toHaveBeenCalled();
  });
});
