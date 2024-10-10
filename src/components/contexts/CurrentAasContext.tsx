'use client';
import React, { PropsWithChildren, createContext, useContext, useState } from 'react';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { RegistryAasData } from 'lib/types/registryServiceTypes';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

type CurrentAasContextType = {
    aasState: [AssetAdministrationShell | null, React.Dispatch<React.SetStateAction<AssetAdministrationShell | null>>];
    submodelState: [SubmodelOrIdReference[], React.Dispatch<React.SetStateAction<SubmodelOrIdReference[]>>]
    registryAasData: [RegistryAasData | null, React.Dispatch<React.SetStateAction<RegistryAasData | null>>];
};

export type SubmodelOrIdReference = {
    id: string;
    submodel?: Submodel;
    error?: string | Error;
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
        throw new Error('registryAasData must be used within a CurrentAasContextProvider');
    }
    return context.registryAasData;
};

export const useSubmodelState = () => {
    const context = useContext(CurrentAasContext);
    if (!context) {
        throw new Error('useSubmodelState must be used within a CurrentAasContextProvider');
    }
    return context.submodelState;
};

export const CurrentAasContextProvider = (props: PropsWithChildren) => {
    const aasState = useState<AssetAdministrationShell | null>(null);
    const registryAasData = useState<RegistryAasData | null>(null);
    const submodelState = useState<SubmodelOrIdReference[]>([]);

    return (
        <CurrentAasContext.Provider value={{ aasState, registryAasData, submodelState }}>{props.children}</CurrentAasContext.Provider>
    );
};
