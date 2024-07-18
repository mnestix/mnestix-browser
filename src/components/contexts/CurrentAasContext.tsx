'use client';
import React, { PropsWithChildren, createContext, useContext, useState } from 'react';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { RegistryAasData } from 'lib/types/registryServiceTypes';

type CurrentAasContextType = {
    aasState: [AssetAdministrationShell | null, React.Dispatch<React.SetStateAction<AssetAdministrationShell | null>>];
    registryAasData: [RegistryAasData | null, React.Dispatch<React.SetStateAction<RegistryAasData | null>>];
};

const CurrentAasContext = createContext<CurrentAasContextType | undefined>(undefined);

export const useCurrentAasContext = () => useContext(CurrentAasContext) as CurrentAasContextType;

export const useAasState = () => {
    const context = useContext(CurrentAasContext);
    if (!context) {
        throw new Error('useAasState must be used within a CurrentAasContextProvider');
    }
    return context.aasState;
};

export const useRegistryAasState = () => {
    const context = useContext(CurrentAasContext);
    if (!context) {
        throw new Error('useSubmodelDescriptorState must be used within a CurrentAasContextProvider');
    }
    return context.registryAasData;
};

export const CurrentAasContextProvider = (props: PropsWithChildren) => {
    const aasState = useState<AssetAdministrationShell | null>(null);
    const registryAasData = useState<RegistryAasData | null>(null);

    return (
        <CurrentAasContext.Provider value={{ aasState, registryAasData }}>{props.children}</CurrentAasContext.Provider>
    );
};
