<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit39235f9c1f76239e6a65be6fd59df6a5
{
    public static $prefixLengthsPsr4 = array (
        'a' => 
        array (
            'app\\' => 4,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'app\\' => 
        array (
            0 => __DIR__ . '/../..' . '/app',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit39235f9c1f76239e6a65be6fd59df6a5::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit39235f9c1f76239e6a65be6fd59df6a5::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInit39235f9c1f76239e6a65be6fd59df6a5::$classMap;

        }, null, ClassLoader::class);
    }
}
