-- @param {String} $1:start_date Start date
-- @param {String} $2:end_date End date
-- @param {Int} $3:limit Limit of the query
SELECT
    `User`.`id`,
    `User`.`name`,
    `User`.`school`,
    `User`.`class`,
    SUM(ScanMetric.max_scan_xp) AS scan_xp_total,
    RANK() OVER (ORDER BY SUM(ScanMetric.max_scan_xp) DESC) AS rank
FROM
    `User`
    LEFT JOIN (
        SELECT 
            user_id,
            scan_id,
            MAX(scan_xp) AS max_scan_xp
        FROM 
            ScanMetric
        WHERE 
            `created_at` >= ?
            AND `created_at` <= ?
        GROUP BY 
            user_id, scan_id
    ) AS ScanMetric ON `User`.id = ScanMetric.user_id
GROUP BY
    `User`.id
ORDER BY
    scan_xp_total DESC
LIMIT ?;
