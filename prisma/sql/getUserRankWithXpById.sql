-- @param {String} $1:start_date Start date
-- @param {String} $2:end_date End date
-- @param {String} $3:user_id User id
SELECT *
FROM (
    SELECT
        `User`.`id`,
        `User`.`avatar`,
        `User`.`name`,
        `User`.`school`,
        `User`.`class`,
        SUM(ScanMetric.max_scan_xp) AS scan_xp_total,
        MAX(ScanMetric.latest_reach_date) AS latest_reach_date, 
        RANK() OVER (ORDER BY SUM(ScanMetric.max_scan_xp) DESC, MAX(ScanMetric.latest_reach_date) DESC) AS rank
    FROM
        `User`
    LEFT JOIN (
        SELECT 
            user_id,
            scan_id,
            MAX(scan_xp) AS max_scan_xp,
            MAX(created_at) AS latest_reach_date
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
) AS ranked_users
WHERE ranked_users.id = ?
LIMIT 1;
