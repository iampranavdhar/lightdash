import {
    CompiledDimension,
    CompiledMetricQuery,
    CompiledTable,
    CreateWarehouseCredentials,
    DimensionType,
    Explore,
    FieldType,
    FilterOperator,
    MetricType,
    SupportedDbtAdapter,
    WarehouseClient,
    WarehouseTypes,
} from '@lightdash/common';

export const warehouseClientMock: WarehouseClient = {
    credentials: {
        type: WarehouseTypes.POSTGRES,
    } as CreateWarehouseCredentials,
    getCatalog: async () => ({
        default: {
            public: {
                table: {
                    id: DimensionType.NUMBER,
                },
            },
        },
    }),
    runQuery: () =>
        Promise.resolve({
            fields: {},
            rows: [],
        }),
    test: () => Promise.resolve(),
    getStartOfWeek: () => undefined,
    getFieldQuoteChar: () => '"',
    getStringQuoteChar: () => "'",
    getEscapeStringQuoteChar: () => "'",
    getMetricSql: (sql, metric) => {
        switch (metric.type) {
            case MetricType.COUNT:
                return `COUNT(${sql})`;
            default:
                return sql;
        }
    },
    getAdapterType: () => SupportedDbtAdapter.POSTGRES,
};

export const bigqueryClientMock: WarehouseClient = {
    credentials: {} as CreateWarehouseCredentials,
    getCatalog: async () => ({
        default: {
            public: {
                table: {
                    id: DimensionType.NUMBER,
                },
            },
        },
    }),
    runQuery: () =>
        Promise.resolve({
            fields: {},
            rows: [],
        }),
    test: () => Promise.resolve(),
    getStartOfWeek: () => undefined,
    getFieldQuoteChar: () => '`',
    getStringQuoteChar: () => "'",
    getEscapeStringQuoteChar: () => '\\',
    getMetricSql: () => '',
    getAdapterType: () => SupportedDbtAdapter.BIGQUERY,
};

export const emptyTable = (name: string): CompiledTable => ({
    name,
    label: name,
    database: 'database',
    schema: 'schema',
    sqlTable: `"db"."schema"."${name}"`,
    dimensions: {},
    metrics: {},
    lineageGraph: {},
});

export const EXPLORE_JOIN_CHAIN: Explore = {
    targetDatabase: SupportedDbtAdapter.POSTGRES,
    name: 'myexplore',
    label: 'myexplore',
    baseTable: 'table1',
    tags: [],
    tables: {
        table1: emptyTable('table1'),
        table2: emptyTable('table2'),
        table3: emptyTable('table3'),
        table4: emptyTable('table4'),
        table5: {
            ...emptyTable('table5'),
            dimensions: {
                dim1: {
                    type: DimensionType.NUMBER,
                    name: 'dim1',
                    label: 'dim1',
                    table: 'table5',
                    tableLabel: 'table5',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.dim1',
                    compiledSql: '"table5".dim1',
                    tablesReferences: ['table5'],
                    hidden: false,
                },
            },
            metrics: {
                metric1: {
                    type: MetricType.MAX,
                    fieldType: FieldType.METRIC,
                    table: 'table5',
                    tableLabel: 'table5',
                    name: 'metric1',
                    label: 'metric1',
                    sql: '${TABLE}.number_column',
                    compiledSql: 'MAX("table5".number_column)',
                    tablesReferences: ['table5'],
                    isAutoGenerated: false,
                    hidden: false,
                },
            },
        },
    },
    joinedTables: [
        {
            table: 'table2',
            sqlOn: '${table2.col} = ${table1.col}',
            compiledSqlOn: '("table2".col) = ("table1".col)',
        },
        {
            table: 'table3',
            sqlOn: '${table3.col} = ${table2.col}',
            compiledSqlOn: '("table3".col) = ("table2".col)',
        },
        {
            table: 'table4',
            sqlOn: '${table4.col} = ${table3.col}',
            compiledSqlOn: '("table4".col) = ("table3".col)',
        },
        {
            table: 'table5',
            sqlOn: '${table5.col} = ${table4.col}',
            compiledSqlOn: '("table5".col) = ("table4".col)',
        },
    ],
};

export const EXPLORE: Explore = {
    targetDatabase: SupportedDbtAdapter.POSTGRES,
    name: 'table1',
    label: 'table1',
    baseTable: 'table1',
    tags: [],
    joinedTables: [
        {
            table: 'table2',
            sqlOn: '${table1.shared} = ${table2.shared}',
            compiledSqlOn: '("table1".shared) = ("table2".shared)',
        },
    ],
    tables: {
        table1: {
            name: 'table1',
            label: 'table1',
            database: 'database',
            schema: 'schema',
            sqlTable: '"db"."schema"."table1"',
            dimensions: {
                dim1: {
                    type: DimensionType.NUMBER,
                    name: 'dim1',
                    label: 'dim1',
                    table: 'table1',
                    tableLabel: 'table1',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.dim1',
                    compiledSql: '"table1".dim1',
                    tablesReferences: ['table1'],
                    hidden: false,
                },
                shared: {
                    type: DimensionType.STRING,
                    name: 'shared',
                    label: 'shared',
                    table: 'table1',
                    tableLabel: 'table1',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.shared',
                    compiledSql: '"table1".shared',
                    tablesReferences: ['table1'],
                    hidden: false,
                },
                with_reference: {
                    type: DimensionType.NUMBER,
                    name: 'with_reference',
                    label: 'with_reference',
                    table: 'table1',
                    tableLabel: 'table1',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.dim1 + ${table2.dim2}',
                    compiledSql: '"table1".dim1 + "table2".dim2',
                    tablesReferences: ['table1', 'table2'],
                    hidden: false,
                },
            },
            metrics: {
                metric1: {
                    type: MetricType.MAX,
                    fieldType: FieldType.METRIC,
                    table: 'table1',
                    tableLabel: 'table1',
                    name: 'metric1',
                    label: 'metric1',
                    sql: '${TABLE}.number_column',
                    compiledSql: 'MAX("table1".number_column)',
                    tablesReferences: ['table1'],
                    isAutoGenerated: false,
                    hidden: false,
                },
                metric_that_references_dim_from_table2: {
                    type: MetricType.MAX,
                    fieldType: FieldType.METRIC,
                    table: 'table1',
                    tableLabel: 'table1',
                    name: 'metric_that_references_dim_from_table2',
                    label: 'Metric that references dim from table2',
                    sql: '${table2.dim2}',
                    compiledSql: 'MAX("table2".dim2)',
                    tablesReferences: ['table1', 'table2'],
                    isAutoGenerated: false,
                    hidden: false,
                },
            },
            lineageGraph: {},
        },
        table2: {
            name: 'table2',
            label: 'table2',
            database: 'database',
            schema: 'schema',
            sqlTable: '"db"."schema"."table2"',
            dimensions: {
                dim2: {
                    type: DimensionType.NUMBER,
                    name: 'dim2',
                    label: 'dim2',
                    table: 'table2',
                    tableLabel: 'table2',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.dim2',
                    compiledSql: '"table2".dim2',
                    tablesReferences: ['table2'],
                    hidden: false,
                },
                shared: {
                    type: DimensionType.STRING,
                    name: 'shared',
                    label: 'shared',
                    table: 'table2',
                    tableLabel: 'table2',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.shared',
                    compiledSql: '"table2".shared',
                    tablesReferences: ['table2'],
                    hidden: false,
                },
            },
            metrics: {
                metric2: {
                    type: MetricType.MAX,
                    fieldType: FieldType.METRIC,
                    table: 'table2',
                    tableLabel: 'table2',
                    name: 'metric2',
                    label: 'metric2',
                    sql: '${TABLE}.number_column',
                    compiledSql: 'MAX("table2".number_column)',
                    tablesReferences: ['table2'],
                    isAutoGenerated: false,
                    hidden: false,
                },
            },
            lineageGraph: {},
        },
    },
};

export const EXPLORE_BIGQUERY: Explore = {
    targetDatabase: SupportedDbtAdapter.BIGQUERY,
    name: 'table1',
    label: 'table1',
    baseTable: 'table1',
    tags: [],
    joinedTables: [
        {
            table: 'table2',
            sqlOn: '${table1.shared} = ${table2.shared}',
            compiledSqlOn: '(table1.shared) = (table2.shared)',
        },
    ],
    tables: {
        table1: {
            name: 'table1',
            label: 'table1',
            database: 'database',
            schema: 'schema',
            sqlTable: '`db`.`schema`.`table1`',
            dimensions: {
                dim1: {
                    type: DimensionType.NUMBER,
                    name: 'dim1',
                    label: 'dim1',
                    table: 'table1',
                    tableLabel: 'table1',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.dim1',
                    compiledSql: '`table1`.dim1',
                    tablesReferences: ['table1'],
                    hidden: false,
                },
                shared: {
                    type: DimensionType.STRING,
                    name: 'shared',
                    label: 'shared',
                    table: 'table1',
                    tableLabel: 'table1',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.shared',
                    compiledSql: '`table1`.shared',
                    tablesReferences: ['table1'],
                    hidden: false,
                },
            },
            metrics: {
                metric1: {
                    type: MetricType.MAX,
                    fieldType: FieldType.METRIC,
                    table: 'table1',
                    tableLabel: 'table1',
                    name: 'metric1',
                    label: 'metric1',
                    sql: '${TABLE}.number_column',
                    compiledSql: 'MAX(`table1`.number_column)',
                    tablesReferences: ['table1'],
                    isAutoGenerated: false,
                    hidden: false,
                },
            },
            lineageGraph: {},
        },
        table2: {
            name: 'table2',
            label: 'table2',
            database: 'database',
            schema: 'schema',
            sqlTable: '"db"."schema"."table2"',
            dimensions: {
                dim2: {
                    type: DimensionType.NUMBER,
                    name: 'dim2',
                    label: 'dim2',
                    table: 'table2',
                    tableLabel: 'table2',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.dim2',
                    compiledSql: '`table2`.dim2',
                    tablesReferences: ['table2'],
                    hidden: false,
                },
                shared: {
                    type: DimensionType.STRING,
                    name: 'shared',
                    label: 'shared',
                    table: 'table2',
                    tableLabel: 'table2',
                    fieldType: FieldType.DIMENSION,
                    sql: '${TABLE}.shared',
                    compiledSql: '`table2`.shared',
                    tablesReferences: ['table2'],
                    hidden: false,
                },
            },
            metrics: {
                metric2: {
                    type: MetricType.MAX,
                    fieldType: FieldType.METRIC,
                    table: 'table2',
                    tableLabel: 'table2',
                    name: 'metric2',
                    label: 'metric2',
                    sql: '${TABLE}.number_column',
                    compiledSql: 'MAX(`table2`.number_column)',
                    tablesReferences: ['table2'],
                    isAutoGenerated: false,
                    hidden: false,
                },
            },
            lineageGraph: {},
        },
    },
};

export const METRIC_QUERY_JOIN_CHAIN: CompiledMetricQuery = {
    dimensions: ['table5_dim1'],
    metrics: ['table5_metric1'],
    filters: {},
    sorts: [],
    limit: 5,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const EXPLORE_WITH_SQL_FILTER = {
    ...EXPLORE,
    tables: {
        ...EXPLORE.tables,
        table1: {
            ...EXPLORE.tables.table1,
            sqlWhere: "${lightdash.attribute.country} = 'US'",
        },
    },
};
export const METRIC_QUERY_JOIN_CHAIN_SQL = `SELECT
  "table5".dim1 AS "table5_dim1",
  MAX("table5".number_column) AS "table5_metric1"
FROM "db"."schema"."table1" AS "table1"
LEFT JOIN "db"."schema"."table2" AS "table2"
  ON ("table2".col) = ("table1".col)
LEFT JOIN "db"."schema"."table3" AS "table3"
  ON ("table3".col) = ("table2".col)
LEFT JOIN "db"."schema"."table4" AS "table4"
  ON ("table4".col) = ("table3".col)
LEFT JOIN "db"."schema"."table5" AS "table5"
  ON ("table5".col) = ("table4".col)

GROUP BY 1

LIMIT 5`;

export const METRIC_QUERY: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: ['table1_metric1'],
    filters: {},
    sorts: [{ fieldId: 'table1_metric1', descending: true }],
    limit: 10,
    tableCalculations: [
        {
            name: 'calc3',
            displayName: '',
            sql: '${table1.dim1} + ${table1.metric1}',
        },
    ],
    compiledTableCalculations: [
        {
            name: 'calc3',
            displayName: '',
            sql: '${table1.dim1} + ${table1.metric1}',
            compiledSql: 'table1_dim1 + table1_metric1',
        },
    ],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_TWO_TABLES: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: ['table2_metric2'],
    filters: {},
    sorts: [{ fieldId: 'table2_metric2', descending: true }],
    limit: 10,
    tableCalculations: [
        {
            name: 'calc3',
            displayName: '',
            sql: '${table1.dim1} + ${table2.metric2}',
        },
    ],
    compiledTableCalculations: [
        {
            name: 'calc3',
            displayName: '',
            sql: '${table1.dim1} + ${table2.metric2}',
            compiledSql: 'table1_dim1 + table2_metric2',
        },
    ],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_TABLE_REFERENCE: CompiledMetricQuery = {
    dimensions: ['table1_with_reference'],
    metrics: [],
    filters: {},
    sorts: [],
    limit: 10,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_TABLE_REFERENCE_SQL = `SELECT
  "table1".dim1 + "table2".dim2 AS "table1_with_reference"
FROM "db"."schema"."table1" AS "table1"
LEFT JOIN "db"."schema"."table2" AS "table2"
  ON ("table1".shared) = ("table2".shared)

GROUP BY 1

LIMIT 10`;

export const METRIC_QUERY_WITH_FILTER: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: [],
    filters: {
        dimensions: {
            id: 'root',
            and: [
                {
                    id: '1',
                    target: {
                        fieldId: 'table2_dim2',
                    },
                    operator: FilterOperator.EQUALS,
                    values: [0],
                },
            ],
        },
    },
    sorts: [{ fieldId: 'table1_dim1', descending: true }],
    limit: 10,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_METRIC_FILTER: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: ['table1_metric1'],
    filters: {
        metrics: {
            id: 'root',
            and: [
                {
                    id: '1',
                    target: {
                        fieldId: 'table1_metric1',
                    },
                    operator: FilterOperator.EQUALS,
                    values: [0],
                },
            ],
        },
    },
    sorts: [{ fieldId: 'table1_metric1', descending: true }],
    limit: 10,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_METRIC_DISABLED_FILTER_THAT_REFERENCES_JOINED_TABLE_DIM: CompiledMetricQuery =
    {
        dimensions: [],
        metrics: ['table1_metric_that_references_dim_from_table2'],
        filters: {
            metrics: {
                id: 'root',
                and: [
                    {
                        id: '1',
                        target: {
                            fieldId:
                                'table1_metric_that_references_dim_from_table2',
                        },
                        operator: FilterOperator.EQUALS,
                        values: [],
                        disabled: true,
                    },
                ],
            },
        },
        sorts: [],
        limit: 10,
        tableCalculations: [],
        compiledTableCalculations: [],
        compiledAdditionalMetrics: [],
    };

export const METRIC_QUERY_WITH_NESTED_METRIC_FILTERS: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: ['table1_metric1'],
    filters: {
        metrics: {
            id: 'root',
            and: [
                {
                    id: '1',
                    target: {
                        fieldId: 'table1_metric1',
                    },
                    operator: FilterOperator.NOT_NULL,
                    values: [],
                },
                {
                    id: 'root',
                    or: [
                        {
                            id: '1',
                            target: {
                                fieldId: 'table1_metric1',
                            },
                            operator: FilterOperator.EQUALS,
                            values: [0],
                        },
                        {
                            id: '1',
                            target: {
                                fieldId: 'table1_metric1',
                            },
                            operator: FilterOperator.EQUALS,
                            values: [1],
                        },
                    ],
                },
            ],
        },
    },
    sorts: [{ fieldId: 'table1_metric1', descending: true }],
    limit: 10,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_FILTER_OR_OPERATOR: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: [],
    filters: {
        dimensions: {
            id: 'root',
            or: [
                {
                    id: '1',
                    target: {
                        fieldId: 'table2_dim2',
                    },
                    operator: FilterOperator.EQUALS,
                    values: [0],
                },
                {
                    id: '2',
                    target: {
                        fieldId: 'table2_dim2',
                    },
                    operator: FilterOperator.NOT_NULL,
                },
            ],
        },
    },
    sorts: [{ fieldId: 'table1_dim1', descending: true }],
    limit: 10,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_DISABLED_FILTER: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: ['table1_metric1'],
    filters: {
        metrics: {
            id: 'root',
            and: [
                {
                    id: '1',
                    target: {
                        fieldId: 'table1_metric1',
                    },
                    operator: FilterOperator.EQUALS,
                    values: [],
                    disabled: true,
                },
            ],
        },
    },
    sorts: [{ fieldId: 'table1_metric1', descending: true }],
    limit: 10,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_FILTER_AND_DISABLED_FILTER: CompiledMetricQuery =
    {
        dimensions: ['table1_dim1'],
        metrics: [],
        filters: {
            dimensions: {
                id: 'root',
                and: [
                    {
                        id: '1-2',
                        target: {
                            fieldId: 'table1_dim1',
                        },
                        operator: FilterOperator.EQUALS,
                        values: [1],
                    },
                    {
                        id: '2',
                        target: {
                            fieldId: 'table2_dim2',
                        },
                        operator: FilterOperator.NOT_NULL,
                        disabled: true,
                    },
                ],
            },
        },
        sorts: [{ fieldId: 'table1_dim1', descending: true }],
        limit: 10,
        tableCalculations: [],
        compiledTableCalculations: [],
        compiledAdditionalMetrics: [],
    };

export const METRIC_QUERY_WITH_NESTED_FILTER_OPERATORS: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: [],
    filters: {
        dimensions: {
            id: 'root',
            and: [
                {
                    id: '1',
                    or: [
                        {
                            id: '1-1',
                            target: {
                                fieldId: 'table2_dim2',
                            },
                            operator: FilterOperator.EQUALS,
                            values: [0],
                        },
                        {
                            id: '1-2',
                            target: {
                                fieldId: 'table2_dim2',
                            },
                            operator: FilterOperator.EQUALS,
                            values: [1],
                        },
                    ],
                },
                {
                    id: '2',
                    target: {
                        fieldId: 'table2_dim2',
                    },
                    operator: FilterOperator.NOT_NULL,
                },
            ],
        },
    },
    sorts: [{ fieldId: 'table1_dim1', descending: true }],
    limit: 10,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_EMPTY_FILTER: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: [],
    filters: {
        dimensions: {
            id: 'true',
            and: [],
        },
    },
    sorts: [{ fieldId: 'table1_dim1', descending: true }],
    limit: 10,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_EMPTY_METRIC_FILTER: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: ['table1_metric1'],
    filters: {
        metrics: {
            id: 'root',
            and: [],
        },
    },
    sorts: [{ fieldId: 'table1_metric1', descending: true }],
    limit: 10,
    tableCalculations: [],
    compiledTableCalculations: [],
    compiledAdditionalMetrics: [],
};

export const METRIC_QUERY_WITH_ADDITIONAL_METRIC: CompiledMetricQuery = {
    dimensions: ['table1_dim1'],
    metrics: ['table2_additional_metric'],
    filters: {},
    sorts: [{ fieldId: 'table2_additional_metric', descending: true }],
    limit: 10,
    tableCalculations: [
        {
            name: 'calc3',
            displayName: '',
            sql: '${table1.dim1} + ${table2.additional_metric}',
        },
    ],
    compiledTableCalculations: [
        {
            name: 'calc3',
            displayName: '',
            sql: '${table1.dim1} + ${table2.additional_metric}',
            compiledSql: 'table1_dim1 + table2_additional_metric',
        },
    ],
    additionalMetrics: [
        {
            type: MetricType.MAX,
            table: 'table2',
            name: 'additional_metric',
            sql: '${TABLE}.number_column',
        },
    ],
    compiledAdditionalMetrics: [
        {
            type: MetricType.MAX,
            fieldType: FieldType.METRIC,
            table: 'table2',
            tableLabel: 'table2',
            name: 'additional_metric',
            label: 'Additional Metric',
            sql: '${TABLE}.number_column',
            compiledSql: 'MAX("table2".number_column)',
            tablesReferences: ['table2'],
            isAutoGenerated: false,
            hidden: false,
        },
    ],
};

export const METRIC_QUERY_WITH_EMPTY_FILTER_GROUPS = {
    ...METRIC_QUERY,
    filters: {
        dimensions: {
            id: '1',
            and: [
                {
                    id: '2',
                    or: [],
                },
            ],
        },
    },
};

export const COMPILED_DIMENSION: CompiledDimension = {
    type: DimensionType.NUMBER,
    name: 'dim1',
    label: 'dim1',
    table: 'table5',
    tableLabel: 'table5',
    fieldType: FieldType.DIMENSION,
    sql: '${TABLE}.dim1',
    compiledSql: '"table5".dim1',
    tablesReferences: ['table5'],
    hidden: false,
};

export const METRIC_QUERY_SQL = `WITH metrics AS (
SELECT
  "table1".dim1 AS "table1_dim1",
  MAX("table1".number_column) AS "table1_metric1"
FROM "db"."schema"."table1" AS "table1"


GROUP BY 1
)
SELECT
  *,
  table1_dim1 + table1_metric1 AS "calc3"
FROM metrics

ORDER BY "table1_metric1" DESC
LIMIT 10`;

export const METRIC_QUERY_SQL_BIGQUERY = `WITH metrics AS (
SELECT
  \`table1\`.dim1 AS \`table1_dim1\`,
  MAX(\`table1\`.number_column) AS \`table1_metric1\`
FROM \`db\`.\`schema\`.\`table1\` AS \`table1\`


GROUP BY 1
)
SELECT
  *,
  table1_dim1 + table1_metric1 AS \`calc3\`
FROM metrics

ORDER BY \`table1_metric1\` DESC
LIMIT 10`;

export const METRIC_QUERY_TWO_TABLES_SQL = `WITH metrics AS (
SELECT
  "table1".dim1 AS "table1_dim1",
  MAX("table2".number_column) AS "table2_metric2"
FROM "db"."schema"."table1" AS "table1"
LEFT JOIN "db"."schema"."table2" AS "table2"
  ON ("table1".shared) = ("table2".shared)

GROUP BY 1
)
SELECT
  *,
  table1_dim1 + table2_metric2 AS "calc3"
FROM metrics

ORDER BY "table2_metric2" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_ADDITIONAL_METRIC_SQL = `WITH metrics AS (
SELECT
  "table1".dim1 AS "table1_dim1",
  MAX("table2".number_column) AS "table2_additional_metric"
FROM "db"."schema"."table1" AS "table1"
LEFT JOIN "db"."schema"."table2" AS "table2"
  ON ("table1".shared) = ("table2".shared)

GROUP BY 1
)
SELECT
  *,
  table1_dim1 + table2_additional_metric AS "calc3"
FROM metrics

ORDER BY "table2_additional_metric" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_FILTER_SQL = `SELECT
  "table1".dim1 AS "table1_dim1"
FROM "db"."schema"."table1" AS "table1"
LEFT JOIN "db"."schema"."table2" AS "table2"
  ON ("table1".shared) = ("table2".shared)
WHERE ((
  ("table2".dim2) IN (0)
))
GROUP BY 1
ORDER BY "table1_dim1" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_EMPTY_FILTER_SQL = `SELECT
  "table1".dim1 AS "table1_dim1"
FROM "db"."schema"."table1" AS "table1"


GROUP BY 1
ORDER BY "table1_dim1" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_EMPTY_METRIC_FILTER_SQL = `SELECT
  "table1".dim1 AS "table1_dim1",
  MAX("table1".number_column) AS "table1_metric1"
FROM "db"."schema"."table1" AS "table1"


GROUP BY 1
ORDER BY "table1_metric1" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_FILTER_OR_OPERATOR_SQL = `SELECT
  "table1".dim1 AS "table1_dim1"
FROM "db"."schema"."table1" AS "table1"
LEFT JOIN "db"."schema"."table2" AS "table2"
  ON ("table1".shared) = ("table2".shared)
WHERE ((
  ("table2".dim2) IN (0)
) OR (
  ("table2".dim2) IS NOT NULL
))
GROUP BY 1
ORDER BY "table1_dim1" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_DISABLED_FILTER_SQL = `WITH metrics AS (
SELECT
  "table1".dim1 AS "table1_dim1",
  MAX("table1".number_column) AS "table1_metric1"
FROM "db"."schema"."table1" AS "table1"


GROUP BY 1
)
SELECT
  *
FROM metrics
WHERE ((
  1=1
))
ORDER BY "table1_metric1" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_NESTED_FILTER_OPERATORS_SQL = `SELECT
  "table1".dim1 AS "table1_dim1"
FROM "db"."schema"."table1" AS "table1"
LEFT JOIN "db"."schema"."table2" AS "table2"
  ON ("table1".shared) = ("table2".shared)
WHERE (((
  ("table2".dim2) IN (0)
) OR (
  ("table2".dim2) IN (1)
)) AND (
  ("table2".dim2) IS NOT NULL
))
GROUP BY 1
ORDER BY "table1_dim1" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_METRIC_FILTER_SQL = `WITH metrics AS (
SELECT
  "table1".dim1 AS "table1_dim1",
  MAX("table1".number_column) AS "table1_metric1"
FROM "db"."schema"."table1" AS "table1"


GROUP BY 1
)
SELECT
  *
FROM metrics
WHERE ((
  ("table1_metric1") IN (0)
))
ORDER BY "table1_metric1" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_METRIC_DISABLED_FILTER_THAT_REFERENCES_JOINED_TABLE_DIM_SQL = `WITH metrics AS (
SELECT
  MAX("table2".dim2) AS "table1_metric_that_references_dim_from_table2"
FROM "db"."schema"."table1" AS "table1"
LEFT JOIN "db"."schema"."table2" AS "table2"
  ON ("table1".shared) = ("table2".shared)


)
SELECT
  *
FROM metrics
WHERE ((
  1=1
))

LIMIT 10`;

export const METRIC_QUERY_WITH_METRIC_FILTER_AND_ONE_DISABLED_SQL = `SELECT
  "table1".dim1 AS "table1_dim1"
FROM "db"."schema"."table1" AS "table1"
LEFT JOIN "db"."schema"."table2" AS "table2"
  ON ("table1".shared) = ("table2".shared)
WHERE ((
  ("table1".dim1) IN (1)
) AND (
  1=1
))
GROUP BY 1
ORDER BY "table1_dim1" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_SQL_FILTER = `SELECT
  "table1".dim1 AS "table1_dim1",
  MAX("table1".number_column) AS "table1_metric1"
FROM "db"."schema"."table1" AS "table1"

WHERE 'EU' = 'US'
GROUP BY 1
ORDER BY "table1_metric1" DESC
LIMIT 10`;

export const METRIC_QUERY_WITH_NESTED_METRIC_FILTERS_SQL = `WITH metrics AS (
SELECT
  "table1".dim1 AS "table1_dim1",
  MAX("table1".number_column) AS "table1_metric1"
FROM "db"."schema"."table1" AS "table1"


GROUP BY 1
)
SELECT
  *
FROM metrics
WHERE ((
  ("table1_metric1") IS NOT NULL
) AND ((
  ("table1_metric1") IN (0)
) OR (
  ("table1_metric1") IN (1)
)))
ORDER BY "table1_metric1" DESC
LIMIT 10`;
