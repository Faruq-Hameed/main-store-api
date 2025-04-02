import { Document, Model, Query } from "mongoose";

// Define the allowed types for the sort option
export type SortOption =
  | string
  | Record<string, 1 | -1 | { $meta: 'textScore' }>
  | Array<[string, 1 | -1]>
  | null
  | undefined;

// Interface for pagination options (all of them are optional)
export interface PaginateOptions {
  page?: number; // The current page number
  limit?: number;
  sort?: SortOption;
  select?: string | Record<string, 0 | 1 | boolean>; // Fields to include or exclude
  populate?: Array<{
    path: string;
    select?: string | Record<string, 0 | 1 | boolean>;
  }>; // Fields to populate with their props
}

// Interface for the paginated result
export interface PaginatedResult<T> {
  docs: T[]; // Array of documents
  totalDocs: number; // Total number of documents
  limit: number; // Number of documents per page
  page: number; // Current page number
  totalPages: number; // Total number of pages
}

/** Generic pagination function expecting model, query, limit and page as parameters */
export const paginate = async <T >(
  model: Model<T>, // model to query from
  query: Record<string, any>, // query parameters to filter
  options: PaginateOptions, // pagination options: sort, limit,page select
): Promise<PaginatedResult<T>> => {
  const { page = 1, limit = 10, sort = {}, select, populate = [] } = options;
  const skip = (page - 1) * limit;

  try {
    // Build the query with optional select fields
    let docsQuery: Query<T[], T> = model.find(query).sort(sort).skip(skip).limit(limit);
    if (select) {
      docsQuery = docsQuery.select(select);
    }

    // handle population of fields and their props
    if (Array.isArray(populate) && populate.length > 0) {
      populate.forEach(({ path, select }) => {
        docsQuery = docsQuery.populate({ path, select, strictPopulate: false });
      });
    }

    // Run the query to fetch the data
    const docs = await docsQuery.exec(); // docs is of type T[]

    // Get the count of documents that match the query
    const totalDocs = await model.countDocuments(query).exec();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalDocs / limit);

    // Return the paginated result
    return {
      docs,
      totalDocs,
      limit,
      page,
      totalPages,
    };
  } catch (error) {
    // Handle any errors that occur during the query
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};
