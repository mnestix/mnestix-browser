import { Check, Close } from '@mui/icons-material';
import {
    Box,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import { LockedTextField } from 'components/basics/LockedTextField';
import { messages } from 'lib/i18n/localization';
import { useEffect, useState } from 'react';
import { Controller, ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { IdGenerationSettingFrontend } from 'lib/types/IdGenerationSettingFrontend';
import { isValidIdPrefix, isValidShortIdPrefix } from 'lib/util/IdValidationUtil';
import { DynamicPartText } from './DynamicPartText';
import {SquaredIconButton} from "components/basics/Buttons";

type IdSettingEntryProps = {
    readonly idSetting: IdGenerationSettingFrontend;
    readonly hasDivider?: boolean;
    readonly editMode: boolean;
    readonly isLoading?: boolean;
    readonly handleChange: (idShort: string, values: { prefix: string; dynamicPart: string }) => void;
    readonly setEditMode: (name: string, value: boolean) => void;
};

type FormInputs = {
    prefix: string;
    dynamicPart: string;
};

const StyledWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    padding: theme.spacing(2),

    '&.has-hover': {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },

    '&.is-loading': {
        opacity: '0.5',
        pointerEvents: 'none',
    },
}));

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexGrow: 1,
}));

const StyledCircularProgressWrapper = styled(Box)(() => ({
    width: '50px',
    height: '50px',
    position: 'absolute',
    right: 0,
    top: 'calc(50% - 10px)',
}));

export function IdSettingEntry(props: IdSettingEntryProps) {
    const setting = props.idSetting;
    let prefixValidation = undefined;
    let errorMessage = <></>;
    const [hasTriggeredChange, setHasTriggeredChange] = useState(true);

    switch (setting.idType) {
        case 'IRI':
            prefixValidation = isValidIdPrefix;
            errorMessage = <FormattedMessage {...messages.mnestix.errorMessages.invalidIri} />;
            break;
        case 'string':
            // For idShorts we want to ensure that it can be part of an IRI
            prefixValidation = isValidShortIdPrefix;
            errorMessage = <FormattedMessage {...messages.mnestix.errorMessages.invalidIriPart} />;
            break;
    }
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormInputs>();

    const onSubmit: SubmitHandler<FormInputs> = (data) => {
        props.setEditMode(setting.name, false);
        if (data.prefix !== setting.prefix.value || data.dynamicPart !== setting.dynamicPart.value) {
            setHasTriggeredChange(true);
            props.handleChange(setting.name, data);
        }
    };

    function handleCancelClick() {
        props.setEditMode(setting.name, false);
    }

    // reset form when user clicks on other entry and this entry leaves edit mode
    useEffect(() => {
        if (!props.editMode) {
            reset();
        }
    }, [props.editMode, reset]);

    // reset loading state if loading is complete
    useEffect(() => {
        if (!props.isLoading) {
            setHasTriggeredChange(false);
        }
    }, [props.isLoading, setHasTriggeredChange]);

    // When there is only one allowed value, we show a locked Textfield instead of a dropdown.
    // The whole thing is wrapped in a <Controller> during render to make it work with react-hook-form
    const dropdownOrLocked = (field: ControllerRenderProps<FormInputs, 'dynamicPart'>) =>
        setting.dynamicPart.allowedValues.length > 1 ? (
            <FormControl fullWidth variant="filled">
                <InputLabel id="dynamic-part">
                    <FormattedMessage {...messages.mnestix.dynamicPart} />
                </InputLabel>
                <Select
                    labelId="dynamic-part"
                    id="dynamic-part-select"
                    label={<FormattedMessage {...messages.mnestix.dynamicPart} />}
                    {...field}
                >
                    {setting.dynamicPart.allowedValues &&
                        setting.dynamicPart.allowedValues.map((el, index) => {
                            return (
                                <MenuItem key={index} value={el}>
                                    {el}
                                </MenuItem>
                            );
                        })}
                </Select>
            </FormControl>
        ) : (
            <LockedTextField
                label={<FormattedMessage {...messages.mnestix.dynamicPart} />}
                sx={{ flexGrow: 1, mr: 1 }}
                fullWidth={true}
                {...field}
            />
        );

    return (
        <Box>
            {!props.hasDivider && <Divider />}
            <StyledWrapper
                className={`
                    ${props.editMode ? '' : 'has-hover'} 
                    ${hasTriggeredChange ? 'is-loading' : ''}
                `}
                onClick={() => !props.editMode && props.setEditMode(setting.name, true)}
            >
                <Typography sx={{ fontWeight: 'bold', width: '160px' }}>{setting.name}</Typography>
                {!props.editMode && (
                    <>
                        <Typography>{setting.prefix.value}</Typography>
                        <DynamicPartText
                            text={setting.dynamicPart.value as string}
                            variant={setting.dynamicPart.value === 'GUID' ? 'regular' : 'reference'}
                        />
                        {hasTriggeredChange && (
                            <StyledCircularProgressWrapper>
                                <CircularProgress size={20} />
                            </StyledCircularProgressWrapper>
                        )}
                    </>
                )}
                {props.editMode && (
                    <StyledForm onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            label={<FormattedMessage {...messages.mnestix.staticPrefix} />}
                            sx={{ flexGrow: 1, mr: 1 }}
                            fullWidth={true}
                            {...register('prefix', {
                                validate: prefixValidation,
                            })}
                            defaultValue={setting.prefix.value}
                            error={!!errors.prefix}
                            helperText={!!errors.prefix && errorMessage}
                        />
                        <Box style={{ width: '200px', minWidth: '200px' }}>
                            <Controller
                                control={control}
                                name="dynamicPart"
                                defaultValue={setting.dynamicPart.value as string}
                                render={({ field }) => dropdownOrLocked(field)}
                            />
                        </Box>
                        <SquaredIconButton variant="text" endIcon={<Check />} sx={{ ml: 1 }} type="submit" />
                        <SquaredIconButton
                            variant="text"
                            endIcon={<Close sx={{ color: 'grey.500' }} />}
                            onClick={() => handleCancelClick()}
                        />
                    </StyledForm>
                )}
            </StyledWrapper>
        </Box>
    );
}
