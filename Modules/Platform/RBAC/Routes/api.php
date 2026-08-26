<?php

use Illuminate\Support\Facades\Route;

use Modules\Platform\RBAC\Http\Controllers\RoleController;
use Modules\Platform\RBAC\Http\Controllers\PermissionController;
use Modules\Platform\RBAC\Http\Controllers\UserMatrixController;
use Modules\Platform\RBAC\Http\Controllers\UserAssignmentController;
use Modules\Platform\RBAC\Http\Controllers\OrganizationUnitController;
use Modules\Platform\RBAC\Http\Controllers\OrganizationLevelController;
use Modules\Platform\RBAC\Http\Controllers\UserMenuController;

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | USER MATRIX
    |--------------------------------------------------------------------------
    |
    | Endpoint utama untuk halaman User Management / User Matrix.
    |
    | 1 row = 1 user
    |
    */

    Route::get(
        'users/matrix',
        [UserMatrixController::class, 'users']
    )->name('users.matrix.index');

    Route::get(
        'matrix/users',
        [UserMatrixController::class, 'index']
    )->name('matrix.users.index');

    Route::get(
        'matrix/users/{user}',
        [UserMatrixController::class, 'show']
    )->name('matrix.users.show');


    /*
    |--------------------------------------------------------------------------
    | USER MATRIX - ROLES
    |--------------------------------------------------------------------------
    */

    Route::post(
        'matrix/users/{user}/roles',
        [UserMatrixController::class, 'storeRole']
    )->name('matrix.users.roles.store');

    Route::delete(
        'matrix/users/{user}/roles/{role}',
        [UserMatrixController::class, 'destroyRole']
    )->name('matrix.users.roles.destroy');


    /*
    |--------------------------------------------------------------------------
    | USER MATRIX - DIRECT PERMISSIONS
    |--------------------------------------------------------------------------
    */

    Route::post(
        'matrix/users/{user}/permissions',
        [UserMatrixController::class, 'storePermission']
    )->name('matrix.users.permissions.store');

    Route::delete(
        'matrix/users/{user}/permissions/{permission}',
        [UserMatrixController::class, 'destroyPermission']
    )->name('matrix.users.permissions.destroy');


    /*
    |--------------------------------------------------------------------------
    | USER MATRIX - ASSIGNMENTS
    |--------------------------------------------------------------------------
    |
    | Assignment dikelola berdasarkan USER.
    |
    | 1 user dapat mempunyai:
    | - 1 primary assignment
    | - beberapa secondary assignment
    |
    */

    Route::post(
        'matrix/users/{user}/assignments',
        [UserMatrixController::class, 'storeAssignment']
    )->name('matrix.users.assignments.store');

    Route::put(
        'matrix/users/{user}/assignments/{assignment}',
        [UserMatrixController::class, 'updateAssignment']
    )->name('matrix.users.assignments.update');

    Route::delete(
        'matrix/users/{user}/assignments/{assignment}',
        [UserMatrixController::class, 'destroyAssignment']
    )->name('matrix.users.assignments.destroy');

    /*
    |--------------------------------------------------------------------------
    | USER MATRIX - MENU ACCESS
    |--------------------------------------------------------------------------
    */

    Route::get(
        'matrix/users/{user}/menus',
        [UserMatrixController::class, 'menus']
    )->name('matrix.users.menus.index');


    Route::put(
        '/matrix/users/{user}/menus',
        [UserMatrixController::class, 'updateMenus']
    )->name('matrix.users.menus.update');

    Route::get(
        '/matrix/users/{user}/menus',
        [UserMatrixController::class, 'menus']
    )->name('matrix.users.menus');

    /*
    |--------------------------------------------------------------------------
    | USER MENU
    |--------------------------------------------------------------------------
    |
    | Endpoint khusus halaman UserMenu.
    |
    | User Matrix  → report matrix
    | User Menu    → melihat menu user
    |
    */

    Route::get(
        'users/{user}/menus',
        [UserMenuController::class, 'index']
    )->name('users.menus.index');

    Route::put(
        'users/{user}/menus',
        [UserMenuController::class, 'update']
    );



    /*
    |--------------------------------------------------------------------------
    | USER MATRIX - SINGLE USER untuk halaman user manage
    |--------------------------------------------------------------------------
    |
    | Detail matrix satu user.
    |
    */

    Route::get(
        'users/{user}/matrix',
        [UserMatrixController::class, 'show']
    )->name('users.matrix');


    /*
    |--------------------------------------------------------------------------
    | MASTER ROLE
    |--------------------------------------------------------------------------
    */

    Route::get(
        'roles/{role}/permissions',
        [RoleController::class, 'permissions']
    )->name('roles.permissions.index');

    Route::get(
        'roles/{role}/available-permissions',
        [RoleController::class, 'availablePermissions']
    )->name('roles.available-permissions');

    Route::put(
        'roles/{role}/permissions',
        [RoleController::class, 'syncPermissions']
    )->name('roles.permissions.sync');

    Route::apiResource(
        'roles',
        RoleController::class
    );



    
    /*
    |--------------------------------------------------------------------------
    | MASTER PERMISSION
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'permissions',
        PermissionController::class
    );


    /*
    |--------------------------------------------------------------------------
    | ASSIGNMENT CRUD
    |--------------------------------------------------------------------------
    |
    | CRUD individual assignment.
    |
    | Endpoint ini BUKAN endpoint utama halaman Assignment.
    |
    */

    Route::apiResource(
        'assignments',
        UserAssignmentController::class
    );


    /*
    |--------------------------------------------------------------------------
    | MASTER ORGANIZATION UNIT
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'organization-units',
        OrganizationUnitController::class
    );


    /*
    |--------------------------------------------------------------------------
    | MASTER ORGANIZATION LEVEL
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'organization-levels',
        OrganizationLevelController::class
    );

});