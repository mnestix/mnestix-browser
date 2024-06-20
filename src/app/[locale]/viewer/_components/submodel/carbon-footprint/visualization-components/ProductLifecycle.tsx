import { alpha, Step, StepLabel, Stepper, Typography, useTheme } from '@mui/material';
import { ProductLifecycleStage } from 'lib/enums/ProductLifecycleStage.enum';
import { messages } from 'lib/i18n/localization';
import { useIntl } from 'react-intl';
import CircleIcon from '@mui/icons-material/Circle';

function findNextStage(stage?: string) {
    const lifecycleStages: string[] = Object.values(ProductLifecycleStage);

    const indexOfCurrentStage = lifecycleStages.findIndex((s) => s === stage);
    if (indexOfCurrentStage === undefined || indexOfCurrentStage === lifecycleStages.length - 1) return undefined;
    return lifecycleStages[indexOfCurrentStage + 1];
}

export function ProductLifecycle(props: { completedStages: ProductLifecycleStage[] }) {
    const intl = useIntl();
    const theme = useTheme();
    const nextStage = findNextStage(props.completedStages.at(-1));

    const colorOfNextStep = alpha(theme.palette.primary.main, 0.2);

    function CustomCircle() {
        return <CircleIcon htmlColor={colorOfNextStep} />;
    }
    return (
        <Stepper
            activeStep={props.completedStages.length}
            orientation="vertical"
            sx={{ '& .Muistel-root': { color: 'blue' } }}
        >
            {props.completedStages.map((step, index) => (
                <Step key={index}>
                    <StepLabel>
                        <Typography fontSize={24}>
                            {!!step &&
                                intl.formatMessage(messages.mnestix.productCarbonFootprint.lifecycleStages[step])}
                        </Typography>
                    </StepLabel>
                </Step>
            ))}
            {nextStage && (
                <Step key="20" active={false}>
                    <StepLabel StepIconComponent={CustomCircle}>
                        <Typography fontSize={24} color={colorOfNextStep}>
                            {intl.formatMessage(messages.mnestix.productCarbonFootprint.lifecycleStages[nextStage])}{' '}
                            (not yet included)
                        </Typography>
                    </StepLabel>
                </Step>
            )}
        </Stepper>
    );
}
