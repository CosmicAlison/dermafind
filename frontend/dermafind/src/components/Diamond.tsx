import diamond from '../assets/diamond.png';

interface DiamondProps {
  size?: number;
  opacity?: number;
  className?: string;
}

export function Diamond({ size = 40, opacity = 1, className }: DiamondProps) {
  return (
    <img src={diamond} className={className} style={{opacity:opacity, width:size, height:size}}></img>
  );
}
