import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "../../theme";
import { GraphPanel } from "../../components/GraphPanel";
import React from "react";
import type { GraphSize } from "../../renderers/graphRenderer";
import type { HistoryEntry } from "../../engine/types";

function renderWithTheme(ui: React.ReactElement) {
	return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("GraphPanel", () => {
	it("renders title", () => {
		const sizeRef = {
			current: null,
		} as React.MutableRefObject<GraphSize | null>;
		renderWithTheme(<GraphPanel history={[]} graphSizeRef={sizeRef} />);
		expect(screen.getByText("Population Dynamics")).toBeInTheDocument();
	});

	it("renders with history data", () => {
		const sizeRef = {
			current: null,
		} as React.MutableRefObject<GraphSize | null>;
		const history: HistoryEntry[] = [
			{ h: 10, c: 5, o: 3 },
			{ h: 12, c: 4, o: 5 },
		];
		renderWithTheme(
			<GraphPanel history={history} graphSizeRef={sizeRef} />,
		);
		expect(screen.getByText("Population Dynamics")).toBeInTheDocument();
	});

	it("sets up graph size ref on mount", () => {
		const sizeRef = {
			current: null,
		} as React.MutableRefObject<GraphSize | null>;
		renderWithTheme(<GraphPanel history={[]} graphSizeRef={sizeRef} />);
		expect(sizeRef.current).not.toBeNull();
	});
});
