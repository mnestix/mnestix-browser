import { forwardRef, SVGProps } from 'react';

// eslint-disable-next-line react/display-name
const SvgrMock = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => <svg ref={ref} {...props} />);

export const ReactComponent = SvgrMock;
export default SvgrMock;
