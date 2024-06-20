export class ProductClass {
    id: string;
    description: string;
    type: string;
}

/**
 * Extracts the first two number blocks of the ProductClass.
 * @param productClass
 */
export const getProductClassId = (productClass: string) => {
    return productClass.slice(0, 5);
};

/**
 * Creates a ProductClass object out of the product class id and the translated product class string.
 * The product class string is expected to be in the format "class (type)".
 * @param id Product class id (e.g. 51-01)
 * @param productClassString Translated Product class string
 */
export const parseProductClassFromString = (id: string, productClassString: string) => {
    const productClassElements = productClassString.split(/[()]/);
    const description = productClassElements[0].trim();
    const type = productClassElements[1];
    const productClass: ProductClass = { id: id, description: description, type: type };

    return productClass;
};
