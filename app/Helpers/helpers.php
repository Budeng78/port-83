<?php
// app/Helpers/helpers.php
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

if (!function_exists('module_schema_create')) {
    /**
     * Membuat tabel dengan prefix otomatis berdasarkan nama modul foldernya.
     */
    function module_schema_create(string $table, \Closure $callback)
    {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 1);
        $filePath = $trace[0]['file'] ?? '';

        $prefix = '';
        if (preg_match('/Modules[\/\\\\]([^\/\\\\]+)/i', $filePath, $matches)) {
            $moduleName = Str::snake($matches[1]); // Contoh: RajangKrosok -> rajangkrosok
            if (!str_starts_with($table, $moduleName . '_')) {
                $prefix = $moduleName . '_';
            }
        }

        return Schema::create($prefix . $table, $callback);
    }
}

if (!function_exists('module_schema_drop')) {
    /**
     * Menghapus tabel dengan prefix otomatis menyesuaikan modulnya.
     */
    function module_schema_drop(string $table)
    {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 1);
        $filePath = $trace[0]['file'] ?? '';

        $prefix = '';
        if (preg_match('/Modules[\/\\\\]([^\/\\\\]+)/i', $filePath, $matches)) {
            $moduleName = Str::snake($matches[1]);
            if (!str_starts_with($table, $moduleName . '_')) {
                $prefix = $moduleName . '_';
            }
        }

        return Schema::dropIfExists($prefix . $table);
    }
}