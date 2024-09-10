import { Box, Button, Divider, FormControl, IconButton, Skeleton, TextField, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { Dispatch, Fragment, SetStateAction } from 'react';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { Control, Controller, FieldArrayWithId, useFieldArray, UseFormGetValues } from 'react-hook-form';
import { ConnectionFormData } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionsCard';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

enum ConnectionType {
    AAS_REPOSITORY = 'AAS_REPOSITORY',
    SUBMODEL_REPOSITORY = 'SUBMODEL_REPOSITORY',
}

const ConnectionTypeMap: Record<string, ConnectionType> = {
    aasRepository: ConnectionType.AAS_REPOSITORY,
    submodelRepository: ConnectionType.SUBMODEL_REPOSITORY,
};

/**
 * This function maps a given connection type string to a valid, static key of `ConnectionFormData`.
 * It is used to pass a fixed (non-dynamic) value as the `name` to the `useFieldArray` hook.
 * Ensuring the name is static, it satisfies the requirement from React Hook Form's documentation
 * that field array names must not be dynamic.
 *
 * @param connectionType - The connection type
 * @returns A static key from the `ConnectionFormData` type, ensuring that the field array name is valid.
 */
const getConnectionTypeName = (connectionType: string): keyof ConnectionFormData => {
    const map: Record<string, keyof ConnectionFormData> = {
        aasRepository: 'aasRepository',
        submodelRepository: 'submodelRepository',
    };

    return map[connectionType];
};

export type MnestixConnectionsFormProps = {
    readonly connectionType: string;
    readonly defaultUrl: string | undefined;
    readonly isLoading: boolean;
    readonly isEditMode: boolean;
    readonly setIsEditMode: Dispatch<SetStateAction<boolean>>;
    readonly control: Control<ConnectionFormData, never>;
    readonly getValues: UseFormGetValues<ConnectionFormData>;
};

export function MnestixConnectionsForm(props: MnestixConnectionsFormProps) {
    const { connectionType, defaultUrl, getValues, isLoading, setIsEditMode, isEditMode } = props;
    const control = props.control as Control<ConnectionFormData, never>;
    const intl = useIntl();

    const dataConnectionName = getConnectionTypeName(connectionType);
    const dataConnectionType = ConnectionTypeMap[connectionType];

    const { fields, append, remove } = useFieldArray<ConnectionFormData>({
        control,
        name: dataConnectionName,
    });

    function getFormControl(
        field: FieldArrayWithId<ConnectionFormData, keyof ConnectionFormData>,
        index: number,
        arrayName: keyof ConnectionFormData,
    ) {
        return (
            <FormControl fullWidth variant="filled" key={field.id}>
                <Box display="flex" flex={1} flexDirection="row" mb={2} alignItems="center">
                    <Typography variant="h4" mr={4} width="200px">
                        <FormattedMessage {...messages.mnestix.connections[dataConnectionName].repositoryLabel} />{' '}
                        {index + 1}
                    </Typography>
                    {isEditMode ? (
                        <Box display="flex" alignItems="center" flex={1}>
                            <Controller
                                name={`${arrayName}.${index}.url`}
                                control={control}
                                defaultValue={field.url}
                                rules={{
                                    required: intl.formatMessage(messages.mnestix.connections.urlFieldRequired),
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        label={
                                            <FormattedMessage
                                                {...messages.mnestix.connections[dataConnectionName].repositoryUrlLabel}
                                            />
                                        }
                                        sx={{ flexGrow: 1, mr: 1 }}
                                        fullWidth={true}
                                        error={!!error}
                                        helperText={error ? error.message : ''}
                                    />
                                )}
                            />
                            <IconButton>
                                <RemoveCircleOutlineIcon onClick={() => remove(index)} />
                            </IconButton>
                        </Box>
                    ) : (
                        <Typography mb={2} mt={2}>
                            {getValues(`${arrayName}.${index}.url`)}
                        </Typography>
                    )}
                </Box>
            </FormControl>
        );
    }

    return (
        <Box sx={{ my: 2 }}>
            <Divider />
            <Typography variant="h3" sx={{ my: 2 }}>
                <FormattedMessage {...messages.mnestix.connections[dataConnectionName].repositories} />
            </Typography>
            <Box display="flex" flexDirection="row" mb={4} alignItems="center">
                <Typography variant="h4" mr={4} width="200px">
                    <FormattedMessage {...messages.mnestix.connections[dataConnectionName].repositoryDefaultLabel} />
                </Typography>
                <Typography>{defaultUrl}</Typography>
            </Box>
            {isLoading &&
                !fields.length &&
                [0, 1, 2].map((i) => {
                    return (
                        <Fragment key={i}>
                            <Skeleton variant="text" width="50%" height={26} sx={{ m: 2 }} />
                        </Fragment>
                    );
                })}
            {!isLoading && fields.map((field, index) => getFormControl(field, index, dataConnectionName))}
            <Box>
                <Button
                    variant="text"
                    startIcon={<ControlPointIcon />}
                    onClick={() => {
                        setIsEditMode(true);
                        append({ id: 'temp', type: dataConnectionType, url: '' });
                    }}
                >
                    <FormattedMessage {...messages.mnestix.connections.addButton} />
                </Button>
            </Box>
        </Box>
    );
}
