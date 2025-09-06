#!/usr/bin/env node

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const archiver = require('archiver');
const { performance } = require('perf_hooks');
const os = require('os');
const crypto = require('crypto');

/**
 * Advanced Zip Generator with modern features and robust error handling
 * @class ZipGenerator
 */
class ZipGenerator {
    constructor() {
        this.config = {
            retryAttempts: 3,
            retryDelay: 1000,
            animationSpeed: 100,
            compressionLevels: {
                store: 0,
                fast: 1,
                default: 6,
                best: 9,
            },
            defaultLevel: 'best',
            excludePatterns: [
                '.git',
                '.gitignore',
                'node_modules',
                '.env',
                '*.log',
                '.DS_Store',
                'Thumbs.db',
            ],
            maxFileSize: 100 * 1024 * 1024, // 100MB
            progressThreshold: 1024 * 1024, // 1MB
        };

        this.stats = {
            filesProcessed: 0,
            totalFiles: 0,
            totalSize: 0,
            compressedSize: 0,
            errors: [],
            warnings: [],
            startTime: null,
            endTime: null,
        };

        this.isAnimating = false;
        this.animationFrames = [
            '⠋',
            '⠙',
            '⠹',
            '⠸',
            '⠼',
            '⠴',
            '⠦',
            '⠧',
            '⠇',
            '⠏',
        ];
        this.currentFrame = 0;
    }

    /**
     * Initialize and validate configuration
     * @param {Object} options - Configuration options
     */
    async initialize(options = {}) {
        this.config = { ...this.config, ...options };

        // Validate paths
        if (this.config.srcDir) {
            this.config.srcDir = path.resolve(this.config.srcDir);
        }
        if (this.config.outPath) {
            this.config.outPath = path.resolve(this.config.outPath);
        }

        // Create output directory if it doesn't exist
        if (this.config.outPath) {
            const outDir = path.dirname(this.config.outPath);
            await this.ensureDirectory(outDir);
        }
    }

    /**
     * Start animated console output
     * @param {string} message - Base message to display
     */
    startAnimation(message = 'Processing') {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.animationInterval = setInterval(() => {
            const frame = this.animationFrames[this.currentFrame];
            const progress =
                this.stats.totalFiles > 0
                    ? Math.round(
                          (this.stats.filesProcessed / this.stats.totalFiles) *
                              100,
                      )
                    : 0;

            process.stdout.write(
                `\r${frame} ${message}... ${progress}% (${this.stats.filesProcessed}/${this.stats.totalFiles})`,
            );
            this.currentFrame =
                (this.currentFrame + 1) % this.animationFrames.length;
        }, this.config.animationSpeed);
    }

    /**
     * Stop animated console output
     */
    stopAnimation() {
        if (!this.isAnimating) return;

        this.isAnimating = false;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        process.stdout.write('\r');
    }

    /**
     * Ensure directory exists, create if not
     * @param {string} dirPath - Directory path to ensure
     */
    async ensureDirectory(dirPath) {
        try {
            await fs.access(dirPath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.mkdir(dirPath, { recursive: true });
                this.logInfo(`Created directory: ${dirPath}`);
            } else {
                throw error;
            }
        }
    }

    /**
     * Check if file should be excluded based on patterns
     * @param {string} filePath - File path to check
     * @returns {boolean} - True if should be excluded
     */
    shouldExclude(filePath) {
        const fileName = path.basename(filePath);
        const relativePath = path.relative(this.config.srcDir || '', filePath);

        return this.config.excludePatterns.some((pattern) => {
            if (pattern.startsWith('*')) {
                return fileName.endsWith(pattern.slice(1));
            }
            return fileName === pattern || relativePath.includes(pattern);
        });
    }

    /**
     * Get comprehensive file statistics
     * @param {string} dirPath - Directory to analyze
     * @returns {Object} - File statistics
     */
    async getFileStats(dirPath) {
        const stats = {
            files: [],
            totalSize: 0,
            count: 0,
            directories: 0,
        };

        const processDirectory = async (currentPath) => {
            try {
                const entries = await fs.readdir(currentPath, {
                    withFileTypes: true,
                });

                for (const entry of entries) {
                    const fullPath = path.join(currentPath, entry.name);

                    if (this.shouldExclude(fullPath)) {
                        this.stats.warnings.push(
                            `Excluded: ${path.relative(dirPath, fullPath)}`,
                        );
                        continue;
                    }

                    if (entry.isDirectory()) {
                        stats.directories++;
                        await processDirectory(fullPath);
                    } else if (entry.isFile()) {
                        try {
                            const fileStat = await fs.stat(fullPath);

                            if (fileStat.size > this.config.maxFileSize) {
                                this.stats.warnings.push(
                                    `Large file skipped (${this.formatBytes(
                                        fileStat.size,
                                    )}): ${path.relative(dirPath, fullPath)}`,
                                );
                                continue;
                            }

                            stats.files.push({
                                path: fullPath,
                                relativePath: path.relative(dirPath, fullPath),
                                size: fileStat.size,
                                modified: fileStat.mtime,
                            });
                            stats.totalSize += fileStat.size;
                            stats.count++;
                        } catch (error) {
                            this.stats.errors.push(
                                `Error reading file ${fullPath}: ${error.message}`,
                            );
                        }
                    }
                }
            } catch (error) {
                this.stats.errors.push(
                    `Error reading directory ${currentPath}: ${error.message}`,
                );
            }
        };

        await processDirectory(dirPath);
        return stats;
    }

    /**
     * Validate source directory
     * @param {string} srcPath - Source directory path
     * @throws {Error} - If validation fails
     */
    async validateSource(srcPath) {
        try {
            const stat = await fs.stat(srcPath);
            if (!stat.isDirectory()) {
                throw new Error(`Source path is not a directory: ${srcPath}`);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`Source directory not found: ${srcPath}`);
            }
            throw error;
        }
    }

    /**
     * Generate unique backup filename if file exists
     * @param {string} filePath - Original file path
     * @returns {string} - Unique file path
     */
    async generateUniqueFilename(filePath) {
        let counter = 1;
        let newPath = filePath;
        const ext = path.extname(filePath);
        const base = filePath.slice(0, -ext.length);

        while (fsSync.existsSync(newPath)) {
            newPath = `${base}_${counter}${ext}`;
            counter++;
        }

        return newPath;
    }

    /**
     * Create compressed archive with progress tracking
     * @param {string} srcPath - Source directory
     * @param {string} outPath - Output zip file path
     * @param {string} compressionLevel - Compression level
     * @returns {Promise<Object>} - Compression results
     */
    async createArchive(srcPath, outPath, compressionLevel = 'best') {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if output file exists and handle accordingly
                if (fsSync.existsSync(outPath)) {
                    if (this.config.overwrite) {
                        await fs.unlink(outPath);
                        this.logInfo(`Removed existing file: ${outPath}`);
                    } else {
                        outPath = await this.generateUniqueFilename(outPath);
                        this.logInfo(`Using unique filename: ${outPath}`);
                    }
                }

                // Get file statistics first
                this.logInfo('Analyzing source directory...');
                const fileStats = await this.getFileStats(srcPath);
                this.stats.totalFiles = fileStats.count;
                this.stats.totalSize = fileStats.totalSize;

                this.logSuccess(
                    `Found ${fileStats.count} files (${this.formatBytes(
                        fileStats.totalSize,
                    )}) in ${fileStats.directories} directories`,
                );

                if (fileStats.count === 0) {
                    throw new Error('No files to compress');
                }

                // Create archive
                const output = fsSync.createWriteStream(outPath);
                const level =
                    this.config.compressionLevels[compressionLevel] || 9;
                const archive = archiver('zip', {
                    zlib: { level },
                    forceLocalTime: true,
                    comment: `Created by Advanced Zip Generator on ${new Date().toISOString()}`,
                });

                // Set up event handlers
                let progressBytes = 0;

                output.on('close', () => {
                    this.stats.compressedSize = archive.pointer();
                    this.stats.endTime = performance.now();
                    resolve({
                        outputPath: outPath,
                        originalSize: this.stats.totalSize,
                        compressedSize: this.stats.compressedSize,
                        compressionRatio: (
                            ((this.stats.totalSize -
                                this.stats.compressedSize) /
                                this.stats.totalSize) *
                            100
                        ).toFixed(2),
                        duration: this.stats.endTime - this.stats.startTime,
                        filesProcessed: this.stats.filesProcessed,
                    });
                });

                output.on('error', (err) => {
                    reject(new Error(`Output stream error: ${err.message}`));
                });

                archive.on('error', (err) => {
                    reject(new Error(`Archive error: ${err.message}`));
                });

                archive.on('warning', (err) => {
                    this.stats.warnings.push(`Archive warning: ${err.message}`);
                });

                archive.on('progress', (progress) => {
                    progressBytes = progress.bytes || 0;
                });

                archive.on('entry', (entry) => {
                    this.stats.filesProcessed++;
                });

                // Start compression
                this.startAnimation('Compressing files');
                archive.pipe(output);

                // Add files to archive
                for (const file of fileStats.files) {
                    try {
                        const fileContent = await fs.readFile(file.path);
                        archive.append(fileContent, {
                            name: file.relativePath,
                            date: file.modified,
                        });
                    } catch (error) {
                        this.stats.errors.push(
                            `Failed to add file ${file.relativePath}: ${error.message}`,
                        );
                    }
                }

                await archive.finalize();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Execute compression with retry logic
     * @param {string} srcDir - Source directory
     * @param {string} outPath - Output path
     * @param {string} compressionLevel - Compression level
     * @returns {Promise<Object>} - Compression results
     */
    async executeWithRetry(srcDir, outPath, compressionLevel) {
        let lastError;

        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                if (attempt > 1) {
                    this.logWarning(
                        `Retry attempt ${attempt}/${this.config.retryAttempts}`,
                    );
                    await this.sleep(this.config.retryDelay * attempt);
                }

                this.stats.startTime = performance.now();
                const result = await this.createArchive(
                    srcDir,
                    outPath,
                    compressionLevel,
                );
                return result;
            } catch (error) {
                lastError = error;
                this.stats.errors.push(
                    `Attempt ${attempt} failed: ${error.message}`,
                );

                if (attempt === this.config.retryAttempts) {
                    break;
                }
            }
        }

        throw new Error(
            `All ${this.config.retryAttempts} attempts failed. Last error: ${lastError.message}`,
        );
    }

    /**
     * Generate MD5 hash of the compressed file
     * @param {string} filePath - Path to the file
     * @returns {Promise<string>} - MD5 hash
     */
    async generateHash(filePath) {
        const hash = crypto.createHash('md5');
        const stream = fsSync.createReadStream(filePath);

        return new Promise((resolve, reject) => {
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    /**
     * Generate comprehensive report
     * @param {Object} result - Compression results
     * @returns {Object} - Detailed report
     */
    async generateReport(result) {
        const duration = result.duration / 1000; // Convert to seconds
        const throughput = result.originalSize / duration / 1024 / 1024; // MB/s
        const hash = await this.generateHash(result.outputPath);

        return {
            summary: {
                success: true,
                outputFile: result.outputPath,
                filesProcessed: result.filesProcessed,
                originalSize: this.formatBytes(result.originalSize),
                compressedSize: this.formatBytes(result.compressedSize),
                compressionRatio: `${result.compressionRatio}%`,
                duration: `${duration.toFixed(2)}s`,
                throughput: `${throughput.toFixed(2)} MB/s`,
                hash: hash,
            },
            statistics: {
                filesProcessed: this.stats.filesProcessed,
                totalFiles: this.stats.totalFiles,
                errors: this.stats.errors.length,
                warnings: this.stats.warnings.length,
            },
            system: {
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
                memory: this.formatBytes(process.memoryUsage().heapUsed),
            },
            errors: this.stats.errors,
            warnings: this.stats.warnings,
        };
    }

    /**
     * Main compression function
     * @param {string} srcDir - Source directory
     * @param {string} outZip - Output zip file
     * @param {string} compressionLevel - Compression level
     * @returns {Promise<Object>} - Compression report
     */
    async compress(srcDir, outZip, compressionLevel = 'best') {
        try {
            // Initialize configuration
            await this.initialize({
                srcDir,
                outPath: outZip,
                overwrite: true,
            });

            // Validate inputs
            await this.validateSource(this.config.srcDir);

            if (
                !Object.keys(this.config.compressionLevels).includes(
                    compressionLevel,
                )
            ) {
                throw new Error(
                    `Invalid compression level: ${compressionLevel}. Available: ${Object.keys(
                        this.config.compressionLevels,
                    ).join(', ')}`,
                );
            }

            this.logInfo(`Starting compression of ${this.config.srcDir}`);
            this.logInfo(`Output: ${this.config.outPath}`);
            this.logInfo(
                `Compression level: ${compressionLevel} (${this.config.compressionLevels[compressionLevel]})`,
            );

            // Execute compression with retry logic
            const result = await this.executeWithRetry(
                this.config.srcDir,
                this.config.outPath,
                compressionLevel,
            );

            this.stopAnimation();

            // Generate and return comprehensive report
            const report = await this.generateReport(result);
            this.displayReport(report);

            return report;
        } catch (error) {
            this.stopAnimation();
            this.logError(`Compression failed: ${error.message}`);

            const errorReport = {
                success: false,
                error: error.message,
                errors: this.stats.errors,
                warnings: this.stats.warnings,
            };

            throw errorReport;
        }
    }

    /**
     * Display formatted report in console
     * @param {Object} report - Report object
     */
    displayReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('               COMPRESSION REPORT');
        console.log('='.repeat(60));

        console.log('\n📊 Summary:');
        console.log(`  ✓ Output File: ${report.summary.outputFile}`);
        console.log(`  ✓ Files Processed: ${report.summary.filesProcessed}`);
        console.log(`  ✓ Original Size: ${report.summary.originalSize}`);
        console.log(`  ✓ Compressed Size: ${report.summary.compressedSize}`);
        console.log(
            `  ✓ Compression Ratio: ${report.summary.compressionRatio}`,
        );
        console.log(`  ✓ Duration: ${report.summary.duration}`);
        console.log(`  ✓ Throughput: ${report.summary.throughput}`);
        console.log(`  ✓ MD5 Hash: ${report.summary.hash}`);

        if (report.statistics.errors > 0 || report.statistics.warnings > 0) {
            console.log('\n⚠️  Issues:');
            console.log(`  Errors: ${report.statistics.errors}`);
            console.log(`  Warnings: ${report.statistics.warnings}`);
        }

        console.log('\n🖥️  System:');
        console.log(
            `  Platform: ${report.system.platform} ${report.system.arch}`,
        );
        console.log(`  Node.js: ${report.system.nodeVersion}`);
        console.log(`  Memory Used: ${report.system.memory}`);

        if (report.errors && report.errors.length > 0) {
            console.log('\n❌ Errors:');
            report.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        if (
            report.warnings &&
            report.warnings.length > 0 &&
            report.warnings.length <= 10
        ) {
            console.log('\n⚠️  Warnings:');
            report.warnings.forEach((warning, index) => {
                console.log(`  ${index + 1}. ${warning}`);
            });
        } else if (report.warnings && report.warnings.length > 10) {
            console.log(
                `\n⚠️  Warnings: ${report.warnings.length} warnings (showing first 5):`,
            );
            report.warnings.slice(0, 5).forEach((warning, index) => {
                console.log(`  ${index + 1}. ${warning}`);
            });
        }

        console.log('\n' + '='.repeat(60));
    }

    /**
     * Utility function to sleep
     * @param {number} ms - Milliseconds to sleep
     */
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Number of bytes
     * @param {number} decimals - Number of decimal places
     * @returns {string} - Formatted string
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
        );
    }

    /**
     * Log info message with formatting
     * @param {string} message - Message to log
     */
    logInfo(message) {
        console.log(`ℹ️  ${message}`);
    }

    /**
     * Log success message with formatting
     * @param {string} message - Message to log
     */
    logSuccess(message) {
        console.log(`✅ ${message}`);
    }

    /**
     * Log warning message with formatting
     * @param {string} message - Message to log
     */
    logWarning(message) {
        console.log(`⚠️  ${message}`);
    }

    /**
     * Log error message with formatting
     * @param {string} message - Message to log
     */
    logError(message) {
        console.error(`❌ ${message}`);
    }
}

/**
 * Configuration Manager for handling various compression settings
 */
class ConfigManager {
    constructor() {
        this.defaultConfig = {
            compressionLevel: 'best',
            excludePatterns: ['.git', 'node_modules', '.env'],
            maxFileSize: 100 * 1024 * 1024,
            retryAttempts: 3,
            overwrite: true,
        };
    }

    /**
     * Load configuration from file or use defaults
     * @param {string} configPath - Path to configuration file
     * @returns {Object} - Configuration object
     */
    async loadConfig(configPath) {
        if (configPath && fsSync.existsSync(configPath)) {
            try {
                const configContent = await fs.readFile(configPath, 'utf8');
                const userConfig = JSON.parse(configContent);
                return { ...this.defaultConfig, ...userConfig };
            } catch (error) {
                console.warn(
                    `Warning: Could not load config from ${configPath}, using defaults`,
                );
            }
        }
        return this.defaultConfig;
    }

    /**
     * Validate configuration object
     * @param {Object} config - Configuration to validate
     * @returns {boolean} - True if valid
     */
    validateConfig(config) {
        const requiredKeys = [
            'compressionLevel',
            'excludePatterns',
            'maxFileSize',
        ];
        return requiredKeys.every((key) => config.hasOwnProperty(key));
    }
}

/**
 * Command Line Interface handler
 */
class CLIHandler {
    constructor() {
        this.zipGenerator = new ZipGenerator();
        this.configManager = new ConfigManager();
    }

    /**
     * Parse command line arguments
     * @returns {Object} - Parsed arguments
     */
    parseArguments() {
        const args = process.argv.slice(2);

        if (args.length < 2) {
            this.showHelp();
            process.exit(1);
        }

        return {
            srcDir: args[0],
            outZip: args[1],
            compressionLevel: args[2] || 'best',
            configFile: args[3] || null,
        };
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log(`
Advanced Zip Generator
Usage: node scripts/generateZip.js <source_directory> <output_file> [compression_level] [config_file]

Parameters:
  source_directory    - Directory to compress
  output_file        - Output zip file path
  compression_level  - Compression level: store, fast, default, best (default: best)
  config_file        - Optional configuration file path

Examples:
  node scripts/generateZip.js static output.zip
  node scripts/generateZip.js static output.zip fast
  node scripts/generateZip.js static output.zip best config.json

Compression Levels:
  store    - No compression (fastest)
  fast     - Fast compression
  default  - Balanced compression
  best     - Maximum compression (slowest)
`);
    }

    /**
     * Execute the CLI command
     */
    async execute() {
        try {
            const args = this.parseArguments();

            // Load configuration if provided
            let config = {};
            if (args.configFile) {
                config = await this.configManager.loadConfig(args.configFile);
            }

            // Apply configuration to zip generator
            if (Object.keys(config).length > 0) {
                await this.zipGenerator.initialize(config);
            }

            // Execute compression
            const report = await this.zipGenerator.compress(
                args.srcDir,
                args.outZip,
                args.compressionLevel,
            );

            if (report.success) {
                process.exit(0);
            } else {
                process.exit(1);
            }
        } catch (error) {
            console.error('\n❌ Fatal Error:', error.error || error.message);

            if (error.errors && error.errors.length > 0) {
                console.error('\nDetailed Errors:');
                error.errors.forEach((err, index) => {
                    console.error(`  ${index + 1}. ${err}`);
                });
            }

            process.exit(1);
        }
    }
}

// Main execution
if (require.main === module) {
    const cli = new CLIHandler();
    cli.execute().catch((error) => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { ZipGenerator, ConfigManager, CLIHandler };
