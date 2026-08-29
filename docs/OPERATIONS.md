# Operations Guide

**Zeo Operational Procedures and Maintenance Guidelines**

## Overview

This document provides operational guidelines for running and maintaining Zeo installations, covering deployment, monitoring, backup, and recovery procedures.

## Installation

### Prerequisites
- Node.js 20+
- pnpm 9+

### Installation Steps
```bash
# Install dependencies
pnpm install

# Verify environment
pnpm doctor

# Build all packages
pnpm -r build
```

### Verification Commands
```bash
# Environment check
pnpm doctor

# Type checking
pnpm -r typecheck

# Testing
pnpm -r test

# Linting
pnpm -r lint

# Full verification
pnpm verify:full
```

## Deployment

### Production Deployment
1. **Environment Preparation**
   - Set up Node.js 20+ environment
   - Configure environment variables (see `.env.example`)
   - Set up required secrets management

2. **Build Process**
   ```bash
   pnpm install
   pnpm -r build
   pnpm verify:full
   ```

3. **Deployment Steps**
   - Deploy built artifacts to target environment
   - Verify all environment variables are set
   - Run health checks
   - Verify database/storage connectivity

### Development Deployment
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build and run
pnpm build
pnpm start
```

## Monitoring

### Health Checks
```bash
# Run health verification
pnpm doctor
```

### Performance Monitoring
- **Build performance**: Monitor build times for regression
- **Test execution**: Track test execution times
- **Type checking**: Monitor typecheck duration

### Log Management
- Application logs written to stdout/stderr
- CI/CD logs retained for 90 days
- Audit logs retained indefinitely

## Backup and Recovery

### Backup Procedures
```bash
# Warehouse data backup
zeo --warehouse export --out ./backup.json --kinds decision,outcome,evidence-event
```

### Recovery Procedures
1. **Data Recovery**
   ```bash
   zeo --warehouse import --in ./backup.json
   ```

2. **Configuration Recovery**
   - Restore from version control
   - Verify environment variables
   - Test configuration validation

### Retention Policies
- **Decision records**: 90 days default (configurable)
- **Evidence events**: 180 days default (configurable)
- **Audit logs**: Indefinite retention
- **Backups**: 30 days retention

## Maintenance

### Regular Maintenance Tasks
1. **Dependency Updates**
   ```bash
   # Update dependencies
   pnpm update

   # Audit for vulnerabilities
   pnpm audit
   ```

2. **Database Maintenance**
   - Run warehouse cleanup periodically
   - Archive old decision records
   - Verify data integrity

3. **Performance Tuning**
   - Monitor build times
   - Optimize TypeScript compilation
   - Review test execution efficiency

### Security Maintenance
1. **Secret Rotation**
   - Rotate API keys quarterly
   - Update environment variables
   - Verify all secrets are encrypted

2. **Vulnerability Scanning**
   ```bash
   # Security audit
   pnpm audit

   # Dependency scanning
   npm audit
   ```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean build artifacts
rm -rf node_modules packages/*/dist

# Reinstall
pnpm install

# Rebuild
pnpm -r build
```

#### Type Errors
```bash
# Type checking
pnpm -r typecheck

# Fix errors in packages/*/src
```

#### Test Failures
```bash
# Run specific tests
pnpm test -- --testNamePattern="test name"

# Debug with verbose output
pnpm test -- --verbose
```

### Diagnostic Commands
```bash
# Environment verification
pnpm doctor

# Dependency tree
pnpm list --depth=0

# Build status
pnpm run build
```

## Operational Contacts

### Support Channels
- **Documentation**: See `docs/` directory
- **Issues**: GitHub Issues
- **Security**: security@zeo.example (see SECURITY.md)

### Escalation Procedures
1. Check documentation and runbooks
2. Review logs and error messages
3. Contact support if issue persists
4. Escalate security issues immediately

## Compliance

### Audit Requirements
- All decisions logged with provenance
- Evidence chain maintained
- Audit trail accessible for review

### Data Retention
- Follow retention policies above
- Legal hold exceptions documented
- Deletion requests processed within 30 days

## Performance Metrics

### Target Metrics
- **Build time**: < 5 minutes
- **Test suite**: < 10 minutes
- **Type checking**: < 2 minutes
- **Memory usage**: < 2GB during builds

### Monitoring Tools
- CI/CD performance tracking
- Automated regression detection
- Resource utilization monitoring

## Security Operations

### Incident Response
1. **Detection**: Automated alerts + manual review
2. **Assessment**: Severity classification
3. **Containment**: Isolate affected components
4. **Remediation**: Deploy fixes
5. **Recovery**: Restore normal operations
6. **Post-Incident**: Document and improve

### Security Monitoring
- Dependency vulnerability alerts
- Secret exposure detection
- Unauthorized access attempts
- Data integrity verification

## Disaster Recovery

### Recovery Objectives
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 24 hours
- **Recovery Priority**: Decision records > Evidence > Config

### Backup Schedule
- **Full backup**: Weekly
- **Incremental**: Daily
- **Retention**: 30 days

### Recovery Procedures
1. Assess damage scope
2. Restore from last known good state
3. Verify data integrity
4. Test functionality
5. Resume operations

## References

- [README.md](./README.md) - Main documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines
- [OPERATOR_RUNBOOK.md](./OPERATOR_RUNBOOK.md) - Quick reference
- [SYSTEM_CONTRACT.md](./SYSTEM_CONTRACT.md) - Core invariants
- [SECURITY.md](./SECURITY.md) - Security policies
- [THREAT_MODEL.md](./THREAT_MODEL.md) - Threat analysis
