import Difference from 'assets/CompareAssets/Difference_decorator.svg';

const iconStyle = {
    flexShrink: 0,
    verticalAlign: 'middle',
    marginRight: '8px',
};

export function DifferenceSymbol() {
    return <Difference style={iconStyle} alt="Difference" />;
}
