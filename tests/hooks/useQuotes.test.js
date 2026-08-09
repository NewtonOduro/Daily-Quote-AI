/**
 * useQuotes.test.js
 * ------------------------------------------------------------------
 * Unit tests for useQuotes: quote generation, category filtering, and
 * daily quote persistence.
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import useQuotes, { todayStamp } from "../../hooks/useQuotes";

describe("useQuotes", () => {
  test("todayStamp returns a YYYY-MM-DD string", () => {
    expect(todayStamp()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("initializes with a quote of the day", async () => {
    const { result } = renderHook(() => useQuotes());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.quoteOfDay).toBeTruthy();
    expect(result.current.activeQuote).toBe(result.current.quoteOfDay);
  });

  test("loads quotes from the bundled dataset", async () => {
    const { result } = renderHook(() => useQuotes());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(Array.isArray(result.current.quotes)).toBe(true);
    expect(result.current.quotes.length).toBeGreaterThan(0);
  });

  test("filters quotes by category", async () => {
    const { result } = renderHook(() => useQuotes());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.setActiveCategory("motivation");
    });
    const filtered = result.current.filteredQuotes;
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((q) => expect(q.category).toBe("motivation"));
  });

  test("filters quotes by search term", async () => {
    const { result } = renderHook(() => useQuotes());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.setSearchTerm("success");
    });
    const filtered = result.current.filteredQuotes;
    filtered.forEach((q) => {
      const haystack = `${q.text} ${q.author} ${q.category}`.toLowerCase();
      expect(haystack).toContain("success");
    });
  });

  test("nextQuote returns a new quote", async () => {
    const { result } = renderHook(() => useQuotes());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const initial = result.current.activeQuote;
    let next;
    await act(async () => {
      next = await result.current.nextQuote();
    });
    expect(next).toBeTruthy();
    expect(result.current.activeQuote).toBe(next);
    expect(initial).toBeTruthy();
  });

  test("persists the quote of the day to storage", async () => {
    const { result } = renderHook(() => useQuotes());
    await waitFor(() => expect(result.current.quoteOfDay).toBeTruthy());
    const stored = await chrome.storage.local.get("dq.quoteOfDay");
    expect(stored["dq.quoteOfDay"]).toBeTruthy();
    expect(stored["dq.quoteOfDay"].quote).toBe(result.current.quoteOfDay);
  });
});
