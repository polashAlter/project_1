import { TQueryObject } from "./../types/common";

const getAllItems = async <T>(
    Model: any,
    query: Partial<Record<keyof T, unknown>> & TQueryObject,
    options: {
        searchableFields?: (keyof T)[];
        filterableFields?: (keyof T)[];
        andConditions?: Record<string, unknown>[];
        isDeletedCondition?: boolean;
        select?: Partial<Record<keyof T, unknown>>;
        include?: Partial<Record<keyof T, unknown>>;
        extraSearchConditions?: Record<string, unknown>[];
        // orderBy?: Partial<Record<keyof T, string>>;
        orderBy?: Record<string, unknown>;
    }
): Promise<{
    data: T[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}> => {
    const sortBy = (query?.sortBy as string) || "createdAt";
    const sortOrder = query?.sortOrder === "desc" ? "desc" : "asc";
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const andConditions = [];

    if (options.andConditions) andConditions.push(...options.andConditions);

    if (!(options.isDeletedCondition === false))
        andConditions.push({ isDeleted: false });

    if (
        query.searchTerm &&
        typeof query.searchTerm === "string" &&
        query.searchTerm.trim() !== ""
    ) {
        andConditions.push({
            OR: [
                ...(options.searchableFields ?? []).map((field) => ({
                    [field]: {
                        contains: query.searchTerm,
                        mode: "insensitive",
                    },
                })),
                ...(options.extraSearchConditions || []),
            ],
        });
    }

    const filterObject = options.filterableFields?.reduce(
        (acc, field) => {
            if (query[field] !== undefined) acc[field] = query[field];
            return acc;
        },
        {} as Record<keyof T, unknown>
    );

    // if (filterObject && Object.keys(filterObject).length > 0) {
    //     andConditions.push({
    //         AND: Object.keys(filterObject).map((key) => {
    //             return {
    //                 [key]: {
    //                     equals: (filterObject as any)[key],
    //                 },
    //             };
    //         }),
    //     });
    // }

    if (filterObject && Object.keys(filterObject).length > 0) {
        Object.keys(filterObject).forEach((key) => {
            const fieldValue = (filterObject as any)[key];

            if (typeof fieldValue === "object" && fieldValue !== null) {
                andConditions.push({
                    [key]: fieldValue,
                });
            } else {
                andConditions.push({
                    [key]: { equals: fieldValue },
                });
            }
        });
    }

    const whereConditions =
        andConditions.length > 0 ? { AND: andConditions } : undefined;

    const result = await Model.findMany({
        where: whereConditions,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: options.orderBy || { [sortBy]: sortOrder },
        ...(options.select && { select: options.select }),
        ...(options.include && { include: options.include }),
    });

    const total = await Model.count({ where: whereConditions });

    return {
        data: result,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export default getAllItems;
