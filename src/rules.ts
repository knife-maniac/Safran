export interface IRules {
    maxAgeInHours?: number,
    maxNumberOfItems?: number,
    removeItemsWithTitleIncluding?: string[]
}

export function apply(items: any[], rules?: IRules): any[] {
    if (rules === undefined) {
        return items;
    }
    // TODO: Apply rules
    return items;
}
