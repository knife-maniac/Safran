import { IExtractedItem } from './extractor.js';


export interface IRules {
    maxAgeInHours?: number,
    maxNumberOfItems?: number,
    removeItemsWithTitleIncluding?: string[]
}

export function apply(items: IExtractedItem[], rules?: IRules): IExtractedItem[] {
    if (rules === undefined) {
        return items;
    }
    // TODO: Apply rules
    return items;
}
