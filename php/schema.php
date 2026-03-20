<?php

namespace App\Services;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

class CarpartsSchema
{
    public static array $tables = [

        /**
         * PRODUCTS
         */
        [
            'id' => 'products',
            'name' => 'cp_products',
            'schema' => [
                ['name' => 'id', 'type' => 'id'],
                ['name' => 'identifier', 'type' => 'string'],
                ['name' => 'parent_id', 'type' => 'string'],

                ['name' => 'title', 'type' => 'string'],
                ['name' => 'item_name', 'type' => 'string'],

                ['name' => 'product_type', 'type' => 'string'],
                ['name' => 'status', 'type' => 'string'],

                ['name' => 'company_name', 'type' => 'string'],
                ['name' => 'model', 'type' => 'string'],

                ['name' => 'year', 'type' => 'integer'],
                ['name' => 'odo_reading', 'type' => 'integer'],

                ['name' => 'stock_status', 'type' => 'string'],

                ['name' => 'price_min', 'type' => 'decimal'],
                ['name' => 'price_max', 'type' => 'decimal'],

                ['name' => 'image', 'type' => 'string'],
                ['name' => 'comments', 'type' => 'text'],

                ['name' => 'meta', 'type' => 'json'],

                ['name' => 'created_at', 'type' => 'timestamp'],
                ['name' => 'updated_at', 'type' => 'timestamp'],

                ['name' => 'identifier', 'type' => 'unique'],
            ]
        ],

        /**
         * VARIANTS (MAIN FILTER TABLE)
         */
        [
            'id' => 'variants',
            'name' => 'cp_product_variants',
            'schema' => [
                ['name' => 'id', 'type' => 'string'],
                ['name' => 'product_id', 'type' => 'integer'],

                ['name' => 'sku', 'type' => 'string'],
                ['name' => 'price', 'type' => 'decimal'],
                ['name' => 'inventory', 'type' => 'integer'],

                ['name' => 'image', 'type' => 'string'],

                ['name' => 'attributes', 'type' => 'json'], // 🔥 JSONB filtering

                ['name' => 'is_default', 'type' => 'boolean'],

                ['name' => 'sku', 'type' => 'unique'],
            ]
        ],

        /**
         * IMAGES MASTER
         */
        [
            'id' => 'images',
            'name' => 'cp_images',
            'schema' => [
                ['name' => 'id', 'type' => 'id'],
                ['name' => 'url', 'type' => 'string'],
                ['name' => 'hashing', 'type' => 'string'],
                ['name' => 'hashing', 'type' => 'unique'],
            ]
        ],

        /**
         * PRODUCT IMAGES RELATION
         */
        [
            'id' => 'product_images',
            'name' => 'cp_product_images',
            'schema' => [
                ['name' => 'product_id', 'type' => 'integer'],
                ['name' => 'image_id', 'type' => 'unsignedInteger'],
                ['name' => ['product_id', 'image_id'], 'type' => 'unique'],
            ]
        ],

        /**
         * CATEGORY MAPPING
         */
        [
            'id' => 'category_mapping',
            'name' => 'cp_category_mapping',
            'schema' => [
                ['name' => 'id', 'type' => 'id'],
                ['name' => 'product_id', 'type' => 'integer'],
                ['name' => 'category', 'type' => 'string'],
                ['name' => 'trademe_category', 'type' => 'string'],
            ]
        ],
    ];

    protected string $postfix;
    protected int $userId;

    public function __construct(int $userId, string $postfix = '')
    {
        $this->userId = $userId;
        $this->postfix = $postfix ?: '_' . $userId;
    }

    /**
     * INSTALL TABLES
     */
    public function install()
    {
        foreach (self::$tables as $table) {

            $tableName = $table['name'] . $this->postfix;
            $schema = $table['schema'];

            if (!Schema::hasTable($tableName)) {

                Schema::create($tableName, function (Blueprint $table) use ($schema) {

                    foreach ($schema as $col) {

                        $name = $col['name'];
                        $type = $col['type'];
                        $default = $col['default'] ?? null;

                        if ($type === 'id') {
                            $table->id();

                        } elseif ($type === 'unique') {
                            $table->unique($name);

                        } elseif ($type === 'decimal') {
                            $table->decimal($name, 10, 2)->nullable();

                        } elseif ($type === 'float') {
                            $table->float($name)->nullable();

                        } elseif ($type === 'json') {
                            $table->json($name)->nullable(); // PostgreSQL JSONB

                        } elseif ($type === 'integer') {
                            $table->integer($name)->nullable();

                        } elseif ($type === 'unsignedInteger') {
                            $table->unsignedBigInteger($name)->nullable();

                        } elseif ($type === 'text') {
                            $table->text($name)->nullable();

                        } elseif ($type === 'boolean') {
                            $table->boolean($name)->default($default ?? false);

                        } elseif ($type === 'timestamp') {
                            $table->timestamp($name)->nullable();

                        } else {
                            $table->string($name)->nullable();
                        }
                    }
                });

                // 🔥 POSTGRESQL INDEXES (IMPORTANT)
                $this->createIndexes($tableName);
            }
        }
    }

    /**
     * CREATE INDEXES (PERFORMANCE)
     */
    protected function createIndexes(string $tableName)
    {
        // Variants table optimizations
        if (str_contains($tableName, 'cp_product_variants')) {

            DB::statement("CREATE INDEX IF NOT EXISTS {$tableName}_product_idx ON {$tableName}(product_id)");

            DB::statement("CREATE INDEX IF NOT EXISTS {$tableName}_price_idx ON {$tableName}(price)");

            // 🔥 JSONB GIN INDEX (MAIN MAGIC)
            DB::statement("CREATE INDEX IF NOT EXISTS {$tableName}_attr_idx ON {$tableName} USING GIN (attributes)");
        }

        // Products table
        if (str_contains($tableName, 'cp_products')) {

            DB::statement("CREATE INDEX IF NOT EXISTS {$tableName}_status_idx ON {$tableName}(status)");

            DB::statement("CREATE INDEX IF NOT EXISTS {$tableName}_type_idx ON {$tableName}(product_type)");
        }
    }

    /**
     * GET TABLE NAMES
     */
    public static function getTablesName(): array
    {
        $tables = [];
        foreach (self::$tables as $table) {
            $tables[$table['id']] = $table['name'];
        }
        return $tables;
    }

    /**
     * GET TABLE COLUMNS
     */
    public static function getTableCols(string $tableId): ?array
    {
        foreach (self::$tables as $table) {

            if ($table['id'] === $tableId) {

                $cols = [];

                foreach ($table['schema'] as $col) {
                    $cols[] = [
                        'name' => $col['name'],
                        'original' => $col['original'] ?? $col['name']
                    ];
                }

                return $cols;
            }
        }

        return null;
    }
}