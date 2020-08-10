;; start with a current owner
(define-data-var current-owner principal 'SP2AYGM74FNMJT9M197EJSB49P88NRH0ES1KZD1BX)

;; function to return the signature of current owner
(define-read-only (get-current-owner)
    (var-get current-owner))

;; helper function to check if a request sender is the current owner
(define-private (is-allowed)
    (is-eq tx-sender (var-get current-owner))
)

;; transfer ownership to a new owner
;; add the old-owner to the provenance list
;; change current-owner to the new owner
(define-public (transfer-ownership (new-owner principal))
    (if
        (is-allowed)
        (begin 
            (add-to-owners (var-get current-owner))
            (ok (var-set current-owner new-owner))
        )
        (err "The user cannot transfer ownership.")
    )
)
 
;; PROVENANCE RECORD 
;; We use the endless-list contract to help us construct 
;; a provenance list which does not have a maximum size. 
;; Referenec: https://github.com/xmakina/endless-list

;; Endless List is a map of (integer, list)
;; Each integer (called a page) links to a finite sized list. 
;; When a list overflows, the page number is incremented and 
;; any new item is added to the new page. 

;; helper function to add an owner to a provenance record
(define-private (add-to-owners (id principal))
    (unwrap-panic (contract-call?
            .endless-list
            add-item
            id))
)

;; function that returns the most recent page in endless-list
(define-read-only (get-latest-provenance)
    (append (unwrap-panic (contract-call?
                            .endless-list
                            get-current-list))
            (var-get current-owner))
)

;; function that returns any given page in the endless-list 
(define-read-only (get-old-provenance (page int))
    (unwrap-panic (contract-call?
                            .endless-list
                            get-items-map-at-page page))
)