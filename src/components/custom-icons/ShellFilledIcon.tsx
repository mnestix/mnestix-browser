import { SvgIcon, SvgIconProps } from '@mui/material';

export function ShellFilledIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <path
                d="M8.33767 4C7.80178 4 7.2883 4.21506 6.91236 4.59697L3.5747 7.98761C3.20641 8.36174 3 8.86567 3 9.39065V19C3 19.5523 3.44772 20 4 20H7.625C8.17728 20 8.625 19.5523 8.625 19V12H15.375V19C15.375 19.5523 15.8227 20 16.375 20H20C20.5523 20 21 19.5523 21 19V9.39065C21 8.86567 20.7936 8.36174 20.4253 7.98761L17.0876 4.59697C16.7117 4.21506 16.1982 4 15.6623 4H8.33767Z"
                fill="currentColor"
            />
        </SvgIcon>
    );
}
