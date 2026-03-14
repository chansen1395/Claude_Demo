import { useCallback } from "react";
import styled from "styled-components";

const FooterBar = styled.footer`
	padding: 0.6rem 1.5rem;
	background: ${(p) => p.theme.colors.footerBg};
	backdrop-filter: blur(10px);
	border-top: 1px solid rgba(0, 255, 136, 0.12);
`;

const ControlsRow = styled.div`
	display: flex;
	align-items: center;
	gap: 1.2rem;
	flex-wrap: wrap;
`;

const Button = styled.button<{ $active?: boolean }>`
	padding: 0.4rem 0.9rem;
	background: ${(p) => (p.$active ? "rgba(0,255,136,0.15)" : "transparent")};
	border: 1.5px solid ${(p) => (p.$active ? "#00ff88" : "#4488ff")};
	color: ${(p) => (p.$active ? "#00ff88" : "#4488ff")};
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.8rem;
	font-weight: 600;
	letter-spacing: 1px;
	transition: all 0.2s;

	&:hover {
		border-color: #00ff88;
		color: #00ff88;
		box-shadow: 0 0 12px rgba(0, 255, 136, 0.3);
	}
`;

const ControlGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
`;

const ControlLabel = styled.label`
	font-size: 0.75rem;
	color: ${(p) => p.theme.colors.textMuted};
	font-weight: 600;
	letter-spacing: 1px;
`;

const ControlValue = styled.span`
	min-width: 32px;
	text-align: right;
	font-family: ${(p) => p.theme.fonts.mono};
	color: ${(p) => p.theme.colors.accent};
	font-weight: 600;
	font-size: 0.8rem;
`;

const Slider = styled.input`
	width: 100px;
	height: 4px;
	border-radius: 2px;
	background: linear-gradient(to right, #4488ff, #00ff88);
	outline: none;
	-webkit-appearance: none;
	appearance: none;

	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #00ff88;
		cursor: pointer;
		box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
	}

	&::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #00ff88;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
	}
`;

const Spacer = styled.div`
	flex: 1;
`;

interface ControlsProps {
	paused: boolean;
	speed: number;
	mutRate: number;
	trails: boolean;
	onTogglePause: () => void;
	onSpeedChange: (speed: number) => void;
	onMutRateChange: (rate: number) => void;
	onToggleTrails: () => void;
	onReset: () => void;
}

export function Controls({
	paused,
	speed,
	mutRate,
	trails,
	onTogglePause,
	onSpeedChange,
	onMutRateChange,
	onToggleTrails,
	onReset,
}: ControlsProps) {
	const mutPercent = Math.round(mutRate * 100);

	const handleSpeedInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) =>
			onSpeedChange(Number(e.target.value)),
		[onSpeedChange],
	);

	const handleMutInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) =>
			onMutRateChange(Number(e.target.value) / 100),
		[onMutRateChange],
	);

	return (
		<FooterBar>
			<ControlsRow>
				<Button $active={!paused} onClick={onTogglePause}>
					{paused ? "▶ PLAY" : "⏸ PAUSE"}
				</Button>
				<ControlGroup>
					<ControlLabel>Speed</ControlLabel>
					<Slider
						type="range"
						min={1}
						max={10}
						value={speed}
						onChange={handleSpeedInput}
					/>
					<ControlValue>{speed}×</ControlValue>
				</ControlGroup>
				<ControlGroup>
					<ControlLabel>Mutation</ControlLabel>
					<Slider
						type="range"
						min={1}
						max={30}
						value={mutPercent}
						onChange={handleMutInput}
					/>
					<ControlValue>{mutPercent}%</ControlValue>
				</ControlGroup>
				<Button $active={trails} onClick={onToggleTrails}>
					☁ {trails ? "Trails" : "No Trails"}
				</Button>
				<Spacer />
				<Button onClick={onReset}>↻ Reset</Button>
			</ControlsRow>
		</FooterBar>
	);
}
