/**
 * QuoteCard.test.jsx
 * ------------------------------------------------------------------
 * Component tests for QuoteCard: ARIA labels, click event triggers,
 * and favorite state toggles.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import QuoteCard from "../../components/QuoteCard";

// Wrap with the audio hooks by mocking useAudioEffects.
jest.mock("../../hooks/useAudioEffects", () => ({
  useAudioEffects: () => ({
    soundsEnabled: true,
    setSoundsEnabled: jest.fn(),
    play: jest.fn()
  })
}));

const sampleQuote = {
  id: "q1",
  text: "The only way to do great work is to love what you do.",
  author: "Steve Jobs",
  category: "success"
};

describe("QuoteCard", () => {
  test("renders the quote text and author", () => {
    render(<QuoteCard quote={sampleQuote} />);
    expect(screen.getByText(/The only way to do great work/i)).toBeInTheDocument();
    expect(screen.getByText(/Steve Jobs/i)).toBeInTheDocument();
  });

  test("has role=article and polite live region", () => {
    render(<QuoteCard quote={sampleQuote} />);
    const article = screen.getByRole("article");
    expect(article).toHaveAttribute("aria-live", "polite");
  });

  test("triggers onFavorite when favorite button clicked", () => {
    const onFavorite = jest.fn();
    render(<QuoteCard quote={sampleQuote} onFavorite={onFavorite} />);
    const favBtn = screen.getByRole("button", { name: /save to favorites/i });
    fireEvent.click(favBtn);
    expect(onFavorite).toHaveBeenCalledWith(sampleQuote);
  });

  test("marks favorite as active when isFavorited", () => {
    render(<QuoteCard quote={sampleQuote} isFavorited />);
    const favBtn = screen.getByRole("button", { name: /remove from favorites/i });
    expect(favBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("triggers onShare when share button clicked", () => {
    const onShare = jest.fn();
    render(<QuoteCard quote={sampleQuote} onShare={onShare} />);
    const shareBtn = screen.getByRole("button", { name: /share quote/i });
    fireEvent.click(shareBtn);
    expect(onShare).toHaveBeenCalled();
  });

  test("shows skeleton when loading", () => {
    render(<QuoteCard quote={sampleQuote} isLoading />);
    expect(screen.getByLabelText(/loading quote/i)).toBeInTheDocument();
  });

  test("shows error fallback for invalid quote", () => {
    render(<QuoteCard quote={null} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
