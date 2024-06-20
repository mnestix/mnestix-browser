import { ListItem, ListItemProps, Typography } from '@mui/material';

export function MenuHeading(props: ListItemProps) {
    return (
        <ListItem sx={{ mt: 2 }}>
            <Typography color="primary.contrastText" variant="body2" sx={{ opacity: 0.8 }}>
                {props.children}
            </Typography>
        </ListItem>
    );
}
