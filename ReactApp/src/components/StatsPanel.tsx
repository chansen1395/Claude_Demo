import styled from "styled-components";
import type { SimStats } from "../engine/types";

const PanelWrapper = styled.div`
	background: linear-gradient(
		135deg,
		rgba(17, 17, 40, 0.92),
		rgba(25, 25, 55, 0.85)
	);
	border: 1px solid ${(p) => p.theme.colors.borderPanel};
	border-radius: 6px;
	padding: 0.7rem;
	backdrop-filter: blur(8px);
	flex: 1;
	min-height: 0;
`;

const PanelTitle = styled.h3`
	font-size: 0.7rem;
	text-transform: uppercase;
	letter-spacing: 2px;
	color: ${(p) => p.theme.colors.accentBlue};
	margin-bottom: 0.5rem;
	opacity: 0.8;
`;

const StatsGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.5rem;
	font-family: ${(p) => p.theme.fonts.mono};
	font-size: 0.8rem;
`;

const StatGroup = styled.div`
	background: ${(p) => p.theme.colors.statBg};
	border: 1px solid ${(p) => p.theme.colors.statBorder};
	border-radius: 4px;
	padding: 0.5rem;
`;

const GroupTitle = styled.div`
	color: ${(p) => p.theme.colors.accentBlue};
	font-size: 0.65rem;
	text-transform: uppercase;
	letter-spacing: 1px;
	margin-bottom: 0.3rem;
	opacity: 0.7;
`;

const StatRow = styled.div<{ $variant?: "danger" | "warn" }>`
	display: flex;
	justify-content: space-between;
	padding: 0.15rem 0;
	font-size: 0.75rem;
`;

const Label = styled.span`
	color: ${(p) => p.theme.colors.textMuted};
`;

const Value = styled.span<{ $variant?: "danger" | "warn" }>`
	color: ${(p) =>
		p.$variant === "danger"
			? p.theme.colors.accentRed
			: p.$variant === "warn"
				? p.theme.colors.accentOrange
				: p.theme.colors.accent};
	font-weight: 600;
`;

interface StatsPanelProps {
	stats: SimStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
	return (
		<PanelWrapper>
			<PanelTitle>Statistics</PanelTitle>
			<StatsGrid>
				<StatGroup>
					<GroupTitle>Herbivores</GroupTitle>
					<StatRow>
						<Label>Alive</Label>
						<Value>{stats.herbs}</Value>
					</StatRow>
					<StatRow>
						<Label>Avg Energy</Label>
						<Value>{stats.hE}</Value>
					</StatRow>
				</StatGroup>
				<StatGroup>
					<GroupTitle>Carnivores</GroupTitle>
					<StatRow $variant="danger">
						<Label>Alive</Label>
						<Value $variant="danger">{stats.carns}</Value>
					</StatRow>
					<StatRow $variant="danger">
						<Label>Avg Energy</Label>
						<Value $variant="danger">{stats.cE}</Value>
					</StatRow>
				</StatGroup>
				<StatGroup>
					<GroupTitle>Omnivores</GroupTitle>
					<StatRow $variant="warn">
						<Label>Alive</Label>
						<Value $variant="warn">{stats.omnis}</Value>
					</StatRow>
					<StatRow $variant="warn">
						<Label>Avg Energy</Label>
						<Value $variant="warn">{stats.oE}</Value>
					</StatRow>
				</StatGroup>
				<StatGroup>
					<GroupTitle>Ecosystem</GroupTitle>
					<StatRow>
						<Label>Food</Label>
						<Value>{stats.food}</Value>
					</StatRow>
					<StatRow>
						<Label>Best Fit</Label>
						<Value>{stats.bestFit}</Value>
					</StatRow>
					<StatRow>
						<Label>Generation</Label>
						<Value>{stats.maxGen}</Value>
					</StatRow>
					<StatRow>
						<Label>Time</Label>
						<Value>{Math.floor(stats.time)}s</Value>
					</StatRow>
				</StatGroup>
			</StatsGrid>
		</PanelWrapper>
	);
}
