CREATE TABLE IF NOT EXISTS stalls (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(32) NOT NULL,
    size VARCHAR(16) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    description TEXT
);

ALTER TABLE stalls
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE stalls
    ADD COLUMN IF NOT EXISTS status VARCHAR(32);

DO
$$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'stalls'
          AND column_name = 'reserved'
    ) THEN
        EXECUTE $q$UPDATE stalls
            SET status = CASE
                WHEN status IS NOT NULL THEN status
                WHEN reserved IS TRUE THEN 'BOOKED'
                ELSE 'AVAILABLE'
            END$q$;
    ELSE
        EXECUTE $q$UPDATE stalls
            SET status = COALESCE(status, 'AVAILABLE')$q$;
    END IF;
END
$$;

ALTER TABLE stalls
    ALTER COLUMN status SET DEFAULT 'AVAILABLE';

ALTER TABLE stalls
    ALTER COLUMN status SET NOT NULL;

DO
$$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'stalls'
          AND column_name = 'reserved'
    ) THEN
        ALTER TABLE stalls DROP COLUMN reserved;
    END IF;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_stalls_code'
          AND conrelid = 'stalls'::regclass
    ) THEN
        ALTER TABLE stalls ADD CONSTRAINT uk_stalls_code UNIQUE (code);
    END IF;
END
$$;

INSERT INTO stalls (code, size, status, description) VALUES
-- Hall N
('N01','SMALL','AVAILABLE','Stall N01 in Hall N'),
('N02','MEDIUM','AVAILABLE','Stall N02 in Hall N'),
('N03','LARGE','AVAILABLE','Stall N03 in Hall N'),
('N04','SMALL','AVAILABLE','Stall N04 in Hall N'),
('N05','MEDIUM','AVAILABLE','Stall N05 in Hall N'),
('N06','LARGE','AVAILABLE','Stall N06 in Hall N'),
('N07','SMALL','AVAILABLE','Stall N07 in Hall N'),
('N08','MEDIUM','AVAILABLE','Stall N08 in Hall N'),

-- Hall M
('M01','SMALL','AVAILABLE','Stall M01 in Hall M'),
('M02','MEDIUM','AVAILABLE','Stall M02 in Hall M'),
('M03','LARGE','AVAILABLE','Stall M03 in Hall M'),
('M04','SMALL','AVAILABLE','Stall M04 in Hall M'),
('M05','MEDIUM','AVAILABLE','Stall M05 in Hall M'),
('M06','LARGE','AVAILABLE','Stall M06 in Hall M'),

-- Hall L
('L01','SMALL','AVAILABLE','Stall L01 in Hall L'),
('L02','MEDIUM','AVAILABLE','Stall L02 in Hall L'),
('L03','LARGE','AVAILABLE','Stall L03 in Hall L'),
('L04','SMALL','AVAILABLE','Stall L04 in Hall L'),
('L05','MEDIUM','AVAILABLE','Stall L05 in Hall L'),
('L06','LARGE','AVAILABLE','Stall L06 in Hall L'),

-- Hall P
('P01','SMALL','AVAILABLE','Stall P01 in Hall P'),
('P02','MEDIUM','AVAILABLE','Stall P02 in Hall P'),
('P03','LARGE','AVAILABLE','Stall P03 in Hall P'),
('P04','SMALL','AVAILABLE','Stall P04 in Hall P'),
('P05','MEDIUM','AVAILABLE','Stall P05 in Hall P'),

-- Hall Q
('Q01','SMALL','AVAILABLE','Stall Q01 in Hall Q'),
('Q02','MEDIUM','AVAILABLE','Stall Q02 in Hall Q'),
('Q03','LARGE','AVAILABLE','Stall Q03 in Hall Q'),
('Q04','SMALL','AVAILABLE','Stall Q04 in Hall Q'),
('Q05','MEDIUM','AVAILABLE','Stall Q05 in Hall Q'),

-- Hall R
('R01','SMALL','AVAILABLE','Stall R01 in Hall R'),
('R02','MEDIUM','AVAILABLE','Stall R02 in Hall R'),
('R03','LARGE','AVAILABLE','Stall R03 in Hall R'),
('R04','SMALL','AVAILABLE','Stall R04 in Hall R'),
('R05','MEDIUM','AVAILABLE','Stall R05 in Hall R'),
('R06','LARGE','AVAILABLE','Stall R06 in Hall R'),
('R07','SMALL','AVAILABLE','Stall R07 in Hall R'),
('R08','MEDIUM','AVAILABLE','Stall R08 in Hall R'),

-- Hall K
('K01','SMALL','AVAILABLE','Stall K01 in Hall K'),
('K02','MEDIUM','AVAILABLE','Stall K02 in Hall K'),
('K03','LARGE','AVAILABLE','Stall K03 in Hall K'),
('K04','SMALL','AVAILABLE','Stall K04 in Hall K'),
('K05','MEDIUM','AVAILABLE','Stall K05 in Hall K'),
('K06','LARGE','AVAILABLE','Stall K06 in Hall K'),
('K07','SMALL','AVAILABLE','Stall K07 in Hall K'),
('K08','MEDIUM','AVAILABLE','Stall K08 in Hall K'),
('K09','LARGE','AVAILABLE','Stall K09 in Hall K'),
('K10','SMALL','AVAILABLE','Stall K10 in Hall K'),

-- Hall J
('J01','SMALL','AVAILABLE','Stall J01 in Hall J'),
('J02','MEDIUM','AVAILABLE','Stall J02 in Hall J'),
('J03','LARGE','AVAILABLE','Stall J03 in Hall J'),
('J04','SMALL','AVAILABLE','Stall J04 in Hall J'),
('J05','MEDIUM','AVAILABLE','Stall J05 in Hall J'),
('J06','LARGE','AVAILABLE','Stall J06 in Hall J'),
('J07','SMALL','AVAILABLE','Stall J07 in Hall J'),
('J08','MEDIUM','AVAILABLE','Stall J08 in Hall J'),
('J09','LARGE','AVAILABLE','Stall J09 in Hall J'),
('J10','SMALL','AVAILABLE','Stall J10 in Hall J'),

-- Hall A
('A01','SMALL','AVAILABLE','Stall A01 in Hall A'),
('A02','MEDIUM','AVAILABLE','Stall A02 in Hall A'),
('A03','LARGE','AVAILABLE','Stall A03 in Hall A'),
('A04','SMALL','AVAILABLE','Stall A04 in Hall A'),
('A05','MEDIUM','AVAILABLE','Stall A05 in Hall A'),
('A06','LARGE','AVAILABLE','Stall A06 in Hall A'),
('A07','SMALL','AVAILABLE','Stall A07 in Hall A'),
('A08','MEDIUM','AVAILABLE','Stall A08 in Hall A'),
('A09','LARGE','AVAILABLE','Stall A09 in Hall A'),
('A10','SMALL','AVAILABLE','Stall A10 in Hall A'),
('A11','MEDIUM','AVAILABLE','Stall A11 in Hall A'),
('A12','LARGE','AVAILABLE','Stall A12 in Hall A'),
('A13','SMALL','AVAILABLE','Stall A13 in Hall A'),
('A14','MEDIUM','AVAILABLE','Stall A14 in Hall A'),
('A15','LARGE','AVAILABLE','Stall A15 in Hall A'),
('A16','SMALL','AVAILABLE','Stall A16 in Hall A'),
('A17','MEDIUM','AVAILABLE','Stall A17 in Hall A'),
('A18','LARGE','AVAILABLE','Stall A18 in Hall A'),
('A19','SMALL','AVAILABLE','Stall A19 in Hall A'),
('A20','MEDIUM','AVAILABLE','Stall A20 in Hall A'),
('A21','LARGE','AVAILABLE','Stall A21 in Hall A'),
('A22','SMALL','AVAILABLE','Stall A22 in Hall A'),
('A23','MEDIUM','AVAILABLE','Stall A23 in Hall A'),
('A24','LARGE','AVAILABLE','Stall A24 in Hall A'),

-- Hall B
('B01','SMALL','AVAILABLE','Stall B01 in Hall B'),
('B02','MEDIUM','AVAILABLE','Stall B02 in Hall B'),
('B03','LARGE','AVAILABLE','Stall B03 in Hall B'),
('B04','SMALL','AVAILABLE','Stall B04 in Hall B'),
('B05','MEDIUM','AVAILABLE','Stall B05 in Hall B'),
('B06','LARGE','AVAILABLE','Stall B06 in Hall B'),
('B07','SMALL','AVAILABLE','Stall B07 in Hall B'),
('B08','MEDIUM','AVAILABLE','Stall B08 in Hall B'),
('B09','LARGE','AVAILABLE','Stall B09 in Hall B'),
('B10','SMALL','AVAILABLE','Stall B10 in Hall B'),
('B11','MEDIUM','AVAILABLE','Stall B11 in Hall B'),
('B12','LARGE','AVAILABLE','Stall B12 in Hall B'),
('B13','SMALL','AVAILABLE','Stall B13 in Hall B'),
('B14','MEDIUM','AVAILABLE','Stall B14 in Hall B'),
('B15','LARGE','AVAILABLE','Stall B15 in Hall B'),
('B16','SMALL','AVAILABLE','Stall B16 in Hall B'),
('B17','MEDIUM','AVAILABLE','Stall B17 in Hall B'),
('B18','LARGE','AVAILABLE','Stall B18 in Hall B'),
('B19','SMALL','AVAILABLE','Stall B19 in Hall B'),
('B20','MEDIUM','AVAILABLE','Stall B20 in Hall B'),
('B21','LARGE','AVAILABLE','Stall B21 in Hall B'),
('B22','SMALL','AVAILABLE','Stall B22 in Hall B'),
('B23','MEDIUM','AVAILABLE','Stall B23 in Hall B'),
('B24','LARGE','AVAILABLE','Stall B24 in Hall B'),

-- Hall C
('C01','SMALL','AVAILABLE','Stall C01 in Hall C'),
('C02','MEDIUM','AVAILABLE','Stall C02 in Hall C'),
('C03','LARGE','AVAILABLE','Stall C03 in Hall C'),
('C04','SMALL','AVAILABLE','Stall C04 in Hall C'),
('C05','MEDIUM','AVAILABLE','Stall C05 in Hall C'),
('C06','LARGE','AVAILABLE','Stall C06 in Hall C'),
('C07','SMALL','AVAILABLE','Stall C07 in Hall C'),
('C08','MEDIUM','AVAILABLE','Stall C08 in Hall C'),
('C09','LARGE','AVAILABLE','Stall C09 in Hall C'),
('C10','SMALL','AVAILABLE','Stall C10 in Hall C'),
('C11','MEDIUM','AVAILABLE','Stall C11 in Hall C'),
('C12','LARGE','AVAILABLE','Stall C12 in Hall C'),

-- Hall D
('D01','SMALL','AVAILABLE','Stall D01 in Hall D'),
('D02','MEDIUM','AVAILABLE','Stall D02 in Hall D'),
('D03','LARGE','AVAILABLE','Stall D03 in Hall D'),
('D04','SMALL','AVAILABLE','Stall D04 in Hall D'),
('D05','MEDIUM','AVAILABLE','Stall D05 in Hall D'),
('D06','LARGE','AVAILABLE','Stall D06 in Hall D'),
('D07','SMALL','AVAILABLE','Stall D07 in Hall D'),
('D08','MEDIUM','AVAILABLE','Stall D08 in Hall D'),
('D09','LARGE','AVAILABLE','Stall D09 in Hall D'),
('D10','SMALL','AVAILABLE','Stall D10 in Hall D'),
('D11','MEDIUM','AVAILABLE','Stall D11 in Hall D'),
('D12','LARGE','AVAILABLE','Stall D12 in Hall D'),

-- Hall H
('H01','SMALL','AVAILABLE','Stall H01 in Hall H'),
('H02','MEDIUM','AVAILABLE','Stall H02 in Hall H'),
('H03','LARGE','AVAILABLE','Stall H03 in Hall H'),
('H04','SMALL','AVAILABLE','Stall H04 in Hall H'),
('H05','MEDIUM','AVAILABLE','Stall H05 in Hall H'),
('H06','LARGE','AVAILABLE','Stall H06 in Hall H'),
('H07','SMALL','AVAILABLE','Stall H07 in Hall H'),
('H08','MEDIUM','AVAILABLE','Stall H08 in Hall H'),
('H09','LARGE','AVAILABLE','Stall H09 in Hall H'),
('H10','SMALL','AVAILABLE','Stall H10 in Hall H'),
('H11','MEDIUM','AVAILABLE','Stall H11 in Hall H'),
('H12','LARGE','AVAILABLE','Stall H12 in Hall H'),
('H13','SMALL','AVAILABLE','Stall H13 in Hall H'),
('H14','MEDIUM','AVAILABLE','Stall H14 in Hall H'),
('H15','LARGE','AVAILABLE','Stall H15 in Hall H'),
('H16','SMALL','AVAILABLE','Stall H16 in Hall H'),
('H17','MEDIUM','AVAILABLE','Stall H17 in Hall H'),
('H18','LARGE','AVAILABLE','Stall H18 in Hall H'),
('H19','SMALL','AVAILABLE','Stall H19 in Hall H'),
('H20','MEDIUM','AVAILABLE','Stall H20 in Hall H')
ON CONFLICT (code) DO NOTHING;