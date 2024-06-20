import { Box, Typography } from '@mui/material';
import { AddressPerLifeCyclePhase } from './ProductJourney';

export function ProductJourneyAddressList(props: { addressesPerLifeCyclePhase: AddressPerLifeCyclePhase[] }) {
    const rowsAdressesList = props.addressesPerLifeCyclePhase
        .filter((v) => v.address.Street && v.address.HouseNumber && v.address.ZipCode && v.address.CityTown)
        .map((phase, index) => {
            return (
                <Typography key={index} variant="body1" sx={{ color: 'primary.main' }}>
                    <Typography key={index} sx={{ color: 'inherit', fontWeight: 600 }} component="span">
                        {`${phase.lifeCyclePhase}:`}{' '}
                    </Typography>
                    {`${phase.address.Street} ${phase.address.HouseNumber}, ${phase.address.ZipCode} ${
                        phase.address.CityTown
                    }${phase.address.Country ? `, ${phase.address.Country}` : undefined}`}
                </Typography>
            );
        });

    return <Box sx={{ marginTop: 1, display: 'flex', flexDirection: 'column' }}>{rowsAdressesList}</Box>;
}
