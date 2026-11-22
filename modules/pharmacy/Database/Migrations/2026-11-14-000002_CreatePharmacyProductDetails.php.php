<?php

declare(strict_types=1);

namespace Modules\Pharmacy\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateProductDetails extends Migration
{
    protected $DBGroup = 'pharmacy';

    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'constraint'     => 20,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'product_id' => [
                'type'       => 'BIGINT',
                'constraint' => 20,
                'unsigned'   => true,
            ],

            // Identitas farmasi
            'generic_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true,
            ],
            'active_ingredient' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true,
            ],
            'dosage_form' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
            ],
            'strength' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
            ],

            // Klasifikasi
            'drug_class' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
            ],

            // Legalitas
            'bpom_number' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => true,
            ],
            'requires_prescription' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],

            // Konversi satuan (JSON)
            'unit_conversion' => [
                'type' => 'JSON',
                'null' => true,
            ],

            // Stok
            'min_stock' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
            ],
            'max_stock' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true,
            ],
            'rack_location' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
            ],

            // Tambahan
            'manufacturer' => [
                'type'       => 'VARCHAR',
                'constraint' => 150,
                'null'       => true,
            ],

            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('product_id');

        // FK ke products.id
        $this->forge->addForeignKey(
            'product_id',
            'products',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->forge->createTable('product_details', true);
    }

    public function down()
    {
        $this->forge->dropTable('product_details', true);
    }
}
