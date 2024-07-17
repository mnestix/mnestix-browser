import { styled } from '@mui/material';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';

const StyledLoadingButton = styled(LoadingButton)(({ theme }) => ({
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    minWidth: '56px',
    maxHeight: '56px',
    height: '56px',
    '.MuiButton-endIcon': {
        margin: 0,
    },
}));

export function SquaredIconButton(props: LoadingButtonProps) {
    return <StyledLoadingButton variant={props.variant || 'contained'} size={props.size || 'large'} {...props} />;
}
export function RoundedIconButton(props: LoadingButtonProps) {
    return <StyledLoadingButton
        variant={props.variant || 'contained'} size={props.size || 'large'} style={{borderRadius: "56px"}} {...props}  />;

}
