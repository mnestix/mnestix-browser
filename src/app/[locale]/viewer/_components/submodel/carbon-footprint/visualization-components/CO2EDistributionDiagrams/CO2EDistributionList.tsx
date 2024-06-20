import { Grid, Paper, styled } from '@mui/material';
import { ProductLifecycleStage } from 'lib/enums/ProductLifecycleStage.enum';
import { messages } from 'lib/i18n/localization';
import { useIntl } from 'react-intl';
import { cutDecimalPlaces } from 'lib/util/NumberUtil';

export function CO2EList(props: { co2EquivalentsPerLifecycleStage: Partial<Record<ProductLifecycleStage, number>> }) {
    const intl = useIntl();
    const { co2EquivalentsPerLifecycleStage } = props;

    const ItemCO2Amount = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(1),
        textAlign: 'right',
        color: '#5e6b7c',
        fontWeight: 'bold',
    }));

    const ItemLifecycleStage = styled(Paper)(({ theme }) => ({
        padding: theme.spacing(1),
        textAlign: 'left',
    }));

    const rows = Object.keys(co2EquivalentsPerLifecycleStage)
        .sort((a, b) => co2EquivalentsPerLifecycleStage[b] - co2EquivalentsPerLifecycleStage[a])
        .map((val, index) => (
            <>
                <Grid item key={index} xs={3} sm={2}>
                    <ItemCO2Amount elevation={0}>{`${cutDecimalPlaces(
                        co2EquivalentsPerLifecycleStage[val],
                        3,
                    )} kg`}</ItemCO2Amount>
                </Grid>
                <Grid item key={index} xs={9} sm={10}>
                    <ItemLifecycleStage elevation={1}>
                        {intl.formatMessage(messages.mnestix.productCarbonFootprint.lifecycleStages[val])}
                    </ItemLifecycleStage>
                </Grid>
            </>
        ));

    return (
        <Grid container spacing={1} columns={12} alignItems="stretch">
            {rows}
        </Grid>
    );
}
