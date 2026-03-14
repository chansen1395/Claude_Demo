import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "../../theme";
import { BrainPanel } from "../../components/BrainPanel";
import { Creature, resetCreatureId } from "../../engine/creature";
import { CFG } from "../../engine/config";
import { Food } from "../../engine/food";
import React from "react";
import type {
	BrainVizSize,
	BrainStatValues,
} from "../../renderers/brainRenderer";

// Mock the brainRenderer to prevent infinite re-render loop
// (BrainPanel's useEffect has no deps array and calls setStats on every render)
vi.mock("../../renderers/brainRenderer", () => ({
	setupBrainCanvas: vi.fn(() => ({ w: 400, h: 220, sx: 2, sy: 2 })),
	renderBrain: vi.fn(() => null),
}));

import { renderBrain } from "../../renderers/brainRenderer";

function renderWithTheme(ui: React.ReactElement) {
	return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("BrainPanel", () => {
	it("renders with null creature", () => {
		const sizeRef = {
			current: null,
		} as React.MutableRefObject<BrainVizSize | null>;
		renderWithTheme(<BrainPanel creature={null} brainSizeRef={sizeRef} />);
		expect(screen.getByText("Neural Network")).toBeInTheDocument();
	});

	it("renders stats grid with default values when no creature", () => {
		const sizeRef = {
			current: null,
		} as React.MutableRefObject<BrainVizSize | null>;
		renderWithTheme(<BrainPanel creature={null} brainSizeRef={sizeRef} />);
		expect(screen.getByText("Species")).toBeInTheDocument();
		expect(screen.getByText("Gen")).toBeInTheDocument();
		expect(screen.getByText("Energy")).toBeInTheDocument();
		expect(screen.getByText("Fitness")).toBeInTheDocument();
	});

	it("renders with a creature that has activations", () => {
		resetCreatureId();
		const creature = new Creature(100, 100, "herb");
		const fakeSim = {
			creatures: [creature],
			food: [new Food()],
			mutRate: CFG.MUT_RATE,
		};
		creature.update(1 / 60, fakeSim as any);

		// Make renderBrain return stats for this render
		const mockStats: BrainStatValues = {
			species: "Herbivore",
			speciesColor: "#00ff88",
			gen: "1",
			energy: "50",
			fitness: "0.5",
			age: "0.0",
			eaten: "0",
		};
		(renderBrain as ReturnType<typeof vi.fn>).mockReturnValueOnce(
			mockStats,
		);

		const sizeRef = {
			current: null,
		} as React.MutableRefObject<BrainVizSize | null>;
		renderWithTheme(
			<BrainPanel creature={creature} brainSizeRef={sizeRef} />,
		);
		expect(screen.getByText("Neural Network")).toBeInTheDocument();
		expect(screen.getByText("Herbivore")).toBeInTheDocument();
	});

	it("sets up brain size ref on mount", () => {
		const sizeRef = {
			current: null,
		} as React.MutableRefObject<BrainVizSize | null>;
		renderWithTheme(<BrainPanel creature={null} brainSizeRef={sizeRef} />);
		expect(sizeRef.current).not.toBeNull();
	});
});
