import styled from "styled-components";

const HeaderBar = styled.header`
	padding: 0.8rem 1.5rem;
	border-bottom: 1px solid ${(p) => p.theme.colors.border};
	background: ${(p) => p.theme.colors.headerBg};
	backdrop-filter: blur(10px);
	display: flex;
	align-items: baseline;
	gap: 1rem;
`;

const Title = styled.h1`
	font-size: 2rem;
	font-weight: 700;
	letter-spacing: 4px;
	background: linear-gradient(90deg, #00ff88, #4488ff);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
`;

const Subtitle = styled.span`
	font-size: 0.8rem;
	color: ${(p) => p.theme.colors.accentBlue};
	letter-spacing: 2px;
	opacity: 0.8;
`;

export function Header() {
	return (
		<HeaderBar>
			<Title>GENESIS</Title>
			<Subtitle>Neuroevolution Ecosystem Simulator</Subtitle>
		</HeaderBar>
	);
}
