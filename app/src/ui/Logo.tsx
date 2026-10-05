import Svg, { Circle, Path } from "react-native-svg";

// The PIKYOO mark (web/src/components/pk/Logo.tsx `small`): the P is a paddle, the optic ball sits on the sweet spot.
const PADDLE = "M14 22a16 16 0 0 1 16-16h2a16 16 0 0 1 16 16v4a16 16 0 0 1-16 16h-6v16H14z";

export function PkMark({ size = 30, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d={PADDLE} fill={color} />
      <Circle cx={31} cy={24} r={7.5} fill="#D4EE3A" />
    </Svg>
  );
}
