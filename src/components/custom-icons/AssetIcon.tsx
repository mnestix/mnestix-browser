import { SvgIcon, SvgIconProps } from '@mui/material';

export function AssetIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.0264 6.78855L12 1.57715L2.9736 6.78855V17.2113L12 22.4227L21.0264 17.2113V6.78855ZM19.0264 9.09795L13 12.5773V19.536L19.0264 16.0566V9.09795ZM11 19.536V12.5773L4.9736 9.09795V16.0566L11 19.536ZM5.9736 7.3659L12 10.8452L18.0264 7.3659L12 3.88655L5.9736 7.3659Z"
                fill="currentColor"
            />
        </SvgIcon>
    );
}
