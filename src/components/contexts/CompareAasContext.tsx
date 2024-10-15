import { AssetAdministrationShell, Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { SubmodelCompareData } from 'lib/types/SubmodelCompareData';
import { generateSubmodelCompareData, isCompareData, isCompareDataRecord } from 'lib/util/CompareAasUtil';
import { getSubmodelFromSubmodelDescriptor, performFullAasSearch } from 'lib/services/search-actions/searchActions';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { getSubmodelDescriptorsById } from 'lib/services/submodelRegistryApiActions';
import { getSubmodelById } from 'lib/services/repository-access/repositorySearchActions';
import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';
import { AasSearchResult } from 'lib/services/search-actions/AasSearcher';

type CompareAasContextType = {
    compareAas: AssetAdministrationShell[];
    compareData: SubmodelCompareData[];
    addAas: (aas: AssetAdministrationShell, submodelDescriptors?: SubmodelDescriptor[]) => Promise<void>;
    addSeveralAas: (aas: string[]) => void;
    deleteAas: (aasId: string) => void;
};

const aasCompareStorage = 'aas';
const compareDataStorage = 'compareData';

const CompareAasContext = createContext<CompareAasContextType | undefined>(undefined);

export const useCompareAasContext = () => useContext(CompareAasContext) as CompareAasContextType;

export const CompareAasContextProvider = (props: PropsWithChildren) => {
    const [compareAas, setCompareAas] = useState<AssetAdministrationShell[]>(() => {
        const storedList = localStorage.getItem(aasCompareStorage);
        return storedList ? JSON.parse(storedList) : [];
    });

    const [compareData, setCompareData] = useState<SubmodelCompareData[]>(() => {
        const storedList = localStorage.getItem(compareDataStorage);
        return storedList ? JSON.parse(storedList) : [];
    });

    useEffect(() => {
        localStorage.setItem(aasCompareStorage, JSON.stringify(compareAas));
        localStorage.setItem(compareDataStorage, JSON.stringify(compareData));

        return () => {
            localStorage.removeItem(aasCompareStorage);
            localStorage.removeItem(compareDataStorage);
        };
    }, [compareAas, compareData]);

    /**
     * Add an aas to the existing compare data state.
     * Hint: Don't use this within a loop, the react useState hook won't be updated.
     */
    const addAas = async (inputAas: AssetAdministrationShell, submodelDescriptors?: SubmodelDescriptor[]) => {
        if (compareAas.length < 3) {
            setCompareAas((prevList) => [...prevList, inputAas]);
            if (inputAas.submodels) {
                const compareDataTemp = await loadSubmodelDataIntoState(
                    compareData,
                    inputAas.submodels,
                    compareAas.length,
                    submodelDescriptors,
                );
                setCompareData(compareDataTemp);
            }
        } else {
            console.error('To many elements on the list');
        }
    };

    /**
     * Fills the empty context with a list of aas.
     */
    const addSeveralAas = async (input: string[]) => {
        const aasList: AssetAdministrationShell[] = [];
        let compareDataTemp: SubmodelCompareData[] = [];
        for (const aasId of input as string[]) {
            let searchResult: AasSearchResult | null = null;
            const response = ApiResponseWrapper.fromPlainObject(await performFullAasSearch(aasId));
            if (response.isSuccess()) searchResult = response.result!;
            const shell: AssetAdministrationShell | null = searchResult?.aas ?? null;
            if (shell) {
                aasList.push(shell!);
                if (shell!.submodels) {
                    compareDataTemp = await loadSubmodelDataIntoState(
                        compareDataTemp,
                        shell.submodels,
                        aasList.length - 1,
                        searchResult?.aasData?.submodelDescriptors,
                    );
                }
            }
        }
        setCompareAas(aasList);
        setCompareData(compareDataTemp);
    };

    const deleteAas = (aasId: string) => {
        for (let i = compareData.length - 1; i >= 0; --i) {
            const cData = compareData[i];
            handleDeleteData(cData, aasId);
            if (cData.dataRecords?.length === 0) compareData.splice(i, 1);
        }

        const updatedAas = compareAas.filter((aas) => aas.id !== aasId);
        setCompareAas(updatedAas);
        localStorage.setItem(aasCompareStorage, JSON.stringify(compareAas));
        if (compareAas.length === 1) {
            setCompareData([]);
        }
    };

    const handleDeleteData = (existingData: SubmodelCompareData, aasId: string) => {
        const aasIndex = compareAas.findIndex((aas) => aas.id === aasId);
        if (existingData.dataRecords) {
            for (let i = existingData.dataRecords?.length - 1; i >= 0; --i) {
                const record = existingData.dataRecords[i];
                if (isCompareData(record)) {
                    handleDeleteData(record, aasId);
                    if (record.dataRecords?.length === 0) {
                        existingData.dataRecords?.splice(i, 1);
                    }
                }
                if (isCompareDataRecord(record)) {
                    record.submodelElements.splice(aasIndex, 1);
                    if (record.submodelElements.every((val) => val === null)) {
                        existingData.dataRecords?.splice(i, 1);
                    }
                }
            }
        }
    };

    const loadSubmodelDataIntoState = async (
        previousCompareData: SubmodelCompareData[],
        input: Reference[],
        aasCount: number,
        submodelDescriptors?: SubmodelDescriptor[],
    ) => {
        const newCompareData: SubmodelCompareData[] = [];
        if (submodelDescriptors && submodelDescriptors.length > 0) {
            for (const submodelDescriptor of submodelDescriptors) {
                const submodelResponse = ApiResponseWrapper.fromPlainObject(
                    await getSubmodelFromSubmodelDescriptor(submodelDescriptor.endpoints[0].protocolInformation.href),
                );
                if (submodelResponse.isSuccess()) {
                    const dataRecord = generateSubmodelCompareData(submodelResponse.result!);
                    newCompareData.push(dataRecord);
                }
            }
        } else {
            for (const reference of input as Reference[]) {
                let submodelAdded = false;
                const response = ApiResponseWrapper.fromPlainObject(
                    await getSubmodelDescriptorsById(reference.keys[0].value),
                );
                if (response.isSuccess()) {
                    const submodelDescriptor = response.result!;
                    const submodelResponse = ApiResponseWrapper.fromPlainObject(
                        await getSubmodelFromSubmodelDescriptor(
                            submodelDescriptor.endpoints[0].protocolInformation.href,
                        ),
                    );
                    if (submodelResponse.isSuccess()) {
                        const dataRecord = generateSubmodelCompareData(submodelResponse.result!);
                        newCompareData.push(dataRecord);
                        submodelAdded = true;
                    }
                } else {
                    console.warn(
                        `Could not be found in Submodel Registry, will continue to look in the repository. ${response.message}`,
                    );
                }

                // Submodel registry is not available or submodel not found there -> search in repo
                if (!submodelAdded) {
                    const submodelData = ApiResponseWrapper.fromPlainObject(
                        await getSubmodelById(reference.keys[0].value),
                    );
                    if (submodelData.isSuccess()) {
                        const dataRecord = generateSubmodelCompareData(submodelData.result!);
                        newCompareData.push(dataRecord);
                    }
                }
            }
        }
        return addCompareData(previousCompareData, newCompareData, aasCount);
    };

    const addCompareData = (
        previousCompareData: SubmodelCompareData[],
        newCompareData: SubmodelCompareData[],
        aasCount: number,
    ): SubmodelCompareData[] => {
        if (aasCount === 0 && previousCompareData.length === 0) {
            return newCompareData;
        }

        // Update the existing data with the incoming dataset.
        const compareDataMap = new Map<string, SubmodelCompareData>();

        previousCompareData.forEach((cData) => {
            if (cData.semanticId) compareDataMap.set(cData.semanticId, cData);
        });

        newCompareData.forEach((newData) => {
            const existingData = compareDataMap.get(newData.semanticId!);
            if (existingData) {
                handleAddToExistingCompareData(newData, existingData, aasCount);
            } else {
                handleAddNewCompareData(newData, aasCount);
                compareDataMap.set(newData.semanticId!, newData);
            }
        });

        // Update the existing data that is absent in the incoming dataset.
        const newRecordsMap = new Map<string, SubmodelCompareData>();

        newCompareData.forEach((newData) => {
            if (newData.semanticId) newRecordsMap.set(newData.semanticId, newData);
        });

        previousCompareData.forEach((cData) => {
            const newData = newRecordsMap.get(cData.semanticId!);
            if (!newData) {
                const existingData = compareDataMap.get(cData.semanticId!);
                if (existingData) {
                    handleAddNullToExistingData(existingData);
                }
            } else {
                const existingData = compareDataMap.get(cData.semanticId!);
                if (existingData) {
                    handleAddNullForNotHandledRecords(existingData, aasCount);
                }
            }
        });

        return Array.from(compareDataMap.values());
    };

    /**
     * Case: Submodel element collection exists in the current data but is absent in the incoming data
     * Action: Inserts "null" into the existing comparison data
     */
    const handleAddNullForNotHandledRecords = (newData: SubmodelCompareData, aasCount: number) => {
        newData.dataRecords?.forEach((record) => {
            if (isCompareDataRecord(record)) {
                if (record.submodelElements.length != aasCount + 1) {
                    record.submodelElements.push(null);
                }
            }
            if (isCompareData(record)) handleAddNullForNotHandledRecords(record, aasCount);
        });
    };

    /**
     * Case: Submodel element collection exists in the current data and in incoming data
     * Action: Inserts "null" into data records that were absent in the incoming data
     */
    const handleAddNullToExistingData = (existingData: SubmodelCompareData) => {
        existingData?.dataRecords?.forEach((existingRecord) => {
            if (isCompareDataRecord(existingRecord)) existingRecord.submodelElements.push(null);
            if (isCompareData(existingRecord)) handleAddNullToExistingData(existingRecord);
        });
    };

    /**
     * Case: Appends data to an existing Compare data element
     * (Semantic IDs of submodels are the same)
     */
    const handleAddToExistingCompareData = (
        newData: SubmodelCompareData,
        existingData: SubmodelCompareData,
        aasCount: number,
    ) => {
        newData.dataRecords?.forEach((newRecord) => {
            const existingRecord = existingData.dataRecords?.find(
                (cRecord) => cRecord.idShort === newRecord.idShort || cRecord.semanticId === newRecord.semanticId,
            );
            if (isCompareData(existingRecord) && isCompareData(newRecord)) {
                handleAddToExistingCompareData(newRecord, existingRecord, aasCount);
            }

            if (!existingRecord && isCompareData(newRecord)) {
                handleAddNewCompareDataCollection(newRecord, aasCount);
                existingData.dataRecords?.push(newRecord);
            }

            if (isCompareDataRecord(newRecord))
                if (existingRecord) {
                    if (isCompareDataRecord(existingRecord) && existingRecord.submodelElements.length < aasCount + 1)
                        existingRecord.submodelElements.push(newRecord.submodelElements[0]);
                } else {
                    const value = newRecord.submodelElements[0];
                    for (let i = 0; i <= aasCount; i++) {
                        newRecord.submodelElements[i] = null;
                        if (i == aasCount) newRecord.submodelElements[i] = value;
                    }
                    existingData.dataRecords?.push(newRecord);
                }
        });

        existingData.dataRecords?.forEach((dataRecord) => {
            if (isCompareDataRecord(dataRecord))
                if (dataRecord.submodelElements.length !== aasCount + 1) {
                    dataRecord.submodelElements.push(null);
                }
        });
    };

    /**
     * Case: Adding new comparison data to existing data
     * (Presence of a new submodel element collection in the incoming data)
     */
    const handleAddNewCompareDataCollection = (newData: SubmodelCompareData, aasCount: number) => {
        newData.dataRecords?.forEach((newRecord) => {
            if (isCompareDataRecord(newRecord)) {
                const value = newRecord.submodelElements[0];
                for (let i = 0; i <= aasCount; i++) {
                    newRecord.submodelElements[i] = null;
                    if (i == aasCount) newRecord.submodelElements[i] = value;
                }
            }
        });
    };

    /**
     * Case: Adds new comparison data to existing data
     * (Inserts a new Submodel with a non-existing Semantic ID
     */
    const handleAddNewCompareData = (newData: SubmodelCompareData, aasCount: number) => {
        newData.dataRecords?.forEach((newRecord) => {
            if (isCompareData(newRecord)) {
                handleAddNewCompareData(newRecord, aasCount);
            }
            if (isCompareDataRecord(newRecord)) {
                const value = newRecord?.submodelElements[0];
                for (let i = 0; i <= aasCount; i++) {
                    newRecord.submodelElements[i] = null;
                    if (i == aasCount) newRecord.submodelElements[i] = value;
                }
            }
        });
    };

    const contextValue: CompareAasContextType = {
        compareAas: compareAas,
        compareData: compareData,
        addAas: addAas,
        deleteAas: deleteAas,
        addSeveralAas: addSeveralAas,
    };

    return <CompareAasContext.Provider value={contextValue}>{props.children}</CompareAasContext.Provider>;
};
