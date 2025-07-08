Employees Hono PostgreSQL is a Hono API that demonstrates interaction with a
PostgreSQL database. API routes are generated automatically based on the
contents of `src/zod`. If the `src/zod` folder consists of `customer.ts` and
`productOrder.ts`, for example, then the API routes will be `/api/v1/customers`
and `/api/v1/product_orders`. The Zod schema names will be snake cased and
pluralized. Only the files in `src/zod` and the `.sql` files in `src/db` are
specific to any tables.
